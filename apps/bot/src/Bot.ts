import { Database, SettingsModel, StateModel, WebhookType } from '@luferro/database';
import { AnimeScheduleApi, GamingApi, MangadexApi, TMDBApi } from '@luferro/entertainment-api';
import { NewsApi } from '@luferro/news-api';
import { RedditApi } from '@luferro/reddit-api';
import { Scraper } from '@luferro/scraper';
import { ArrayUtil, DateUtil, EnumUtil, logger } from '@luferro/shared-utils';
import { CronJob } from 'cron';
import { Client, ClientOptions, Collection, EmbedBuilder, Events, Guild } from 'discord.js';
import { GuildQueueEvent, GuildQueueEvents, Player } from 'discord-player';
import i18next from 'i18next';

import { getSanitizedEnvConfig } from './config/environment';
import * as CommandsHandler from './handlers/commands';
import * as EventsHandler from './handlers/events';
import * as JobsHandler from './handlers/jobs';
import type { APIs, Cache, Commands, Connection, Event, Job, Tools } from './types/bot';
import { getInitConfig } from './utils/i18n';
import { initializeLeopard, initializePorcupine, initializeRhino, initializeTextToSpeech } from './utils/speech';

type StateArgs = { title: string; url: string };
type WebhookArgs = { guild: Guild; category: WebhookType };
type PropageArgs = { category: WebhookType; content: string; embeds: EmbedBuilder[]; everyone?: boolean };

export class Bot extends Client {
	private static readonly MAX_EMBEDS_SIZE = 10;
	static readonly ROLES_MESSAGE_ID = 'CLAIM_YOUR_ROLES';

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Commands = {
		voice: new Collection(),
		interactions: { metadata: [], methods: new Collection() },
	};

	api: APIs;
	scraper: Scraper;
	cache: Cache;
	player: Player;
	tools: Tools;
	connection: Connection;
	config: ReturnType<typeof getSanitizedEnvConfig>;

	constructor(options: ClientOptions) {
		super(options);
		this.config = getSanitizedEnvConfig();
		this.api = this.initializeAPIs();
		this.scraper = this.initializeScraper();
		this.tools = this.initializeTools();
		this.connection = this.initializeVoiceConfig();
		this.player = this.initializePlayer();
		this.cache = this.initializeCache();
	}

	private initializeAPIs(): APIs {
		const config = {
			anime: { apiKey: this.config.ANIME_SCHEDULE_API_KEY },
			gaming: {
				igdb: { clientId: this.config.IGDB_CLIENT_ID, clientSecret: this.config.IGDB_CLIENT_SECRET },
				deals: { apiKey: this.config.ITAD_API_KEY },
				steam: { apiKey: this.config.STEAM_API_KEY },
			},
			news: { apiKey: this.config.GNEWS_API_KEY },
			shows: { apiKey: this.config.THE_MOVIE_DB_API_KEY },
		};

		return {
			anime: new AnimeScheduleApi(config.anime),
			mangadex: new MangadexApi(),
			gaming: new GamingApi(config.gaming),
			news: new NewsApi(config.news),
			reddit: new RedditApi(),
			shows: new TMDBApi(config.shows),
		};
	}

	private initializeScraper(): Scraper {
		return new Scraper();
	}

	private initializeVoiceConfig(): Connection {
		return {
			config: {
				leaveOnEmpty: true,
				leaveOnEmptyCooldown: 1000 * 60 * 5,
				leaveOnEnd: false,
				selfDeaf: false,
				bufferingTimeout: 0,
			},
		};
	}

	private initializeTools(): Tools {
		const config = { apiKey: this.config.PICOVOICE_API_KEY };

		return {
			textToSpeech: initializeTextToSpeech(),
			speechToText: initializeLeopard(config),
			speechToIntent: initializeRhino(config),
			wakeWord: initializePorcupine(config),
		};
	}

	private initializePlayer(): Player {
		const player = new Player(this);
		player.extractors.loadDefault();
		logger.debug(player.scanDeps());
		return player;
	}

	private initializeCache(): Cache {
		return { anime: { schedule: new Collection() } };
	}

	private initializeListeners() {
		for (const [name, { data, execute }] of Bot.events.entries()) {
			const callback = (...args: unknown[]) =>
				execute({ client: this, rest: args }).catch((error) => {
					this.emit('clientError', error);
					return;
				});

			const discordEvents = EnumUtil.enumKeysToArray(Events);
			const isDiscordEvent = discordEvents.some((key) => Events[key] === name);

			const playerEvents = EnumUtil.enumKeysToArray(GuildQueueEvent);
			const isPlayerEvent = playerEvents.some((key) => GuildQueueEvent[key] === name);

			const isClientEvent = isDiscordEvent || (!isDiscordEvent && !isPlayerEvent);
			if (isClientEvent) this[data.type](name, callback);
			else this.player.events[data.type](name as keyof GuildQueueEvents, callback);

			logger.info(`**${isClientEvent ? 'Client' : 'Player'}** is listening ${data.type} **${name}**.`);
		}
	}

	private initializeSchedulers() {
		if (this.config.NODE_ENV !== 'PRODUCTION') return;

		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () =>
				job.execute({ client: this }).catch((error) => {
					error.message = `Job **${name}** failed. Reason: ${error.message}`;
					this.emit('clientError', error);
					return;
				}),
			);
			cronjob.start();
			logger.info(`Job **${name}** is set to run. Schedule: **(${job.data.schedule})**.`);
		}
	}

	async start() {
		logger.info(`Starting SerpineBot in **${this.config.NODE_ENV.trim()}**.`);

		try {
			i18next.init(await getInitConfig(this.config.LOCALE));
			if (i18next.resolvedLanguage) DateUtil.setI18nLocale({ locale: i18next.resolvedLanguage });

			await this.login(this.config.BOT_TOKEN);
			await Database.connect(this.config.MONGO_URI);
			await JobsHandler.registerJobs();
			await EventsHandler.registerEvents();
			await CommandsHandler.registerCommands();

			this.initializeListeners();
			this.initializeSchedulers();

			this.emit('ready', this as Client);
		} catch (error) {
			logger.error('Fatal error during application start.', error);
			this.stop();
		}
	}

	async state(entry: StateArgs) {
		return await StateModel.createEntry(entry);
	}

	async webhook({ guild, category }: WebhookArgs) {
		const settings = await SettingsModel.getSettingsByGuildId({ guildId: guild.id });
		const webhook = settings?.webhooks.get(category);
		if (!webhook) return null;

		const guildWebhooks = await guild.fetchWebhooks();
		if (!guildWebhooks.has(webhook.id)) {
			await SettingsModel.removeWebhook({ guildId: guild.id, category });
			return null;
		}

		return await this.fetchWebhook(webhook.id, webhook.token);
	}

	async propageMessage({ category, everyone, content }: Omit<PropageArgs, 'embeds'>) {
		for (const { 1: guild } of this.guilds.cache) {
			const webhook = await this.webhook({ guild, category });
			if (!webhook) continue;

			await webhook.send({ content: everyone ? `${guild.roles.everyone}, ${content}` : content });
		}
	}

	async propageMessages({ category, everyone, embeds }: Omit<PropageArgs, 'content'>) {
		for (const { 1: guild } of this.guilds.cache) {
			const webhook = await this.webhook({ guild, category });
			if (!webhook) continue;

			const chunks = ArrayUtil.splitIntoChunks(embeds, Bot.MAX_EMBEDS_SIZE);
			for (const chunk of chunks) {
				await webhook.send({ content: everyone ? `${guild.roles.everyone}` : undefined, embeds: chunk });
			}
		}
	}

	stop() {
		logger.info('Stopping SerpineBot.');
		Database.disconnect();
		process.exit(1);
	}
}
