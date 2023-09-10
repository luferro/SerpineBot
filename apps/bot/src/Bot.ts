import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Database, SettingsModel, StateModel, WebhookType } from '@luferro/database';
import { AnimeApi, ComicsApi, GamingApi, MangadexApi, ShowsApi } from '@luferro/entertainment-api';
import { NewsApi } from '@luferro/news-api';
import { RedditApi } from '@luferro/reddit-api';
import { InteractiveScraper, SearchEngine, StaticScraper, Youtube } from '@luferro/scraper';
import { ArrayUtil, EnumUtil, FetchError, logger } from '@luferro/shared-utils';
import { Leopard } from '@picovoice/leopard-node';
import { BuiltinKeyword, Porcupine } from '@picovoice/porcupine-node';
import { Rhino } from '@picovoice/rhino-node';
import { CronJob } from 'cron';
import { Client, ClientOptions, Collection, EmbedBuilder, Events, Guild } from 'discord.js';
import { GuildQueueEvent, GuildQueueEvents, Player } from 'discord-player';
import i18next from 'i18next';
import { resolve } from 'path';

import { getSanitizedEnvConfig } from './config/environment';
import * as CommandsHandler from './handlers/commands';
import * as EventsHandler from './handlers/events';
import * as JobsHandler from './handlers/jobs';
import type { Api, Cache, Commands, Connection, Event, Job, Scraper, Tools } from './types/bot';
import { getInitConfig } from './utils/i18n';

type StateArgs = { title: string; url: string };
type WebhookArgs = { guild: Guild; category: WebhookType };
type PropageArgs = { category: WebhookType; content: string; embeds: EmbedBuilder[]; everyone?: boolean };

export class Bot extends Client {
	private static readonly MAX_EMBEDS_SIZE = 10;
	static readonly ROLES_MESSAGE_ID = 'CLAIM_YOUR_ROLES';

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Commands = { voice: new Collection(), interactions: { metadata: [], execute: new Collection() } };

	api: Api;
	scraper: Scraper;
	cache: Cache;
	player: Player;
	tools: Tools;
	connection: Connection;
	config: ReturnType<typeof getSanitizedEnvConfig>;

	constructor(options: ClientOptions) {
		super(options);
		this.config = getSanitizedEnvConfig();
		this.api = this.initializeApis();
		this.scraper = this.initializeScraper();
		this.tools = this.initializeTools();
		this.connection = this.initializeVoiceConfig();
		this.player = this.initializePlayer();
		this.cache = { anime: { schedule: new Collection() }, deals: { chart: [] } };
	}

	private initializeApis() {
		NewsApi.auth.setApiKey(this.config.GNEWS_API_KEY);
		GamingApi.steam.auth.setApiKey(this.config.STEAM_API_KEY);
		GamingApi.deals.auth.setApiKey(this.config.ITAD_API_KEY);
		ShowsApi.auth.setApiKey(this.config.THE_MOVIE_DB_API_KEY);
		AnimeApi.schedule.auth.setApiKey(this.config.ANIME_SCHEDULE_API_KEY);

		return {
			anime: AnimeApi,
			comics: ComicsApi,
			mangadex: MangadexApi,
			gaming: GamingApi,
			news: NewsApi,
			reddit: RedditApi,
			shows: ShowsApi,
		};
	}

	private initializeScraper() {
		return { interactive: InteractiveScraper, static: StaticScraper, searchEngine: SearchEngine, youtube: Youtube };
	}

	private initializeVoiceConfig() {
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

	private initializeTools() {
		const porcupine = resolve('models/porcupine');
		const leopard = resolve('models/leopard');
		const rhino = resolve('models/rhino');

		return {
			wakeWord: new Porcupine(
				this.config.PICOVOICE_API_KEY,
				[`${porcupine}/wakeword_en_${process.platform}.ppn`, BuiltinKeyword.BUMBLEBEE],
				[0.8, 0.5],
			),
			speechToIntent: new Rhino(
				this.config.PICOVOICE_API_KEY,
				`${rhino}/model_en_${process.platform}.rhn`,
				0.5,
				0.5,
				false,
			),
			speechToText: new Leopard(this.config.PICOVOICE_API_KEY, { modelPath: `${leopard}/model_en.pv` }),
			textToSpeech: new TextToSpeechClient(),
		};
	}

	private initializePlayer() {
		const player = new Player(this);
		player.extractors.loadDefault();
		logger.debug(player.scanDeps());
		return player;
	}

	private initializeListeners() {
		for (const [name, { data, execute }] of Bot.events.entries()) {
			const callback = (...args: unknown[]) => execute({ client: this, rest: args }).catch(this.handleError);

			const isClient = EnumUtil.enumKeysToArray(Events).some((key) => Events[key] === name);
			const isPlayer = EnumUtil.enumKeysToArray(GuildQueueEvent).some((key) => GuildQueueEvent[key] === name);
			const isClientEvent = isClient || (!isClient && !isPlayer);

			if (isClientEvent) this[data.type](name, callback);
			else this.player.events[data.type](name as keyof GuildQueueEvents, callback);

			logger.info(`**${isClientEvent ? 'Client' : 'Player'}** is listening ${data.type} **${name}**.`);
		}
	}

	private initializeSchedulers() {
		for (const [name, job] of Bot.jobs.entries()) {
			new CronJob(job.data.schedule, () =>
				job.execute({ client: this }).catch((error) => {
					error.message = `Job **${name}** failed. Reason: ${error.message}`;
					this.handleError(error);
				}),
			).start();
			logger.info(`Job **${name}** is set to run. Schedule: **(${job.data.schedule})**.`);
		}
	}

	async start() {
		logger.info(`Starting SerpineBot in **${this.config.NODE_ENV.trim()}**.`);

		try {
			i18next.init(await getInitConfig(this.config.LOCALE));

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

	handleError(error: Error, client?: Bot) {
		const isPlayerError = error.stack?.includes('discord-player');
		const isFetchError = error instanceof FetchError;
		logger[isPlayerError || isFetchError ? 'warn' : 'error'](error);

		if (isPlayerError) this.emit('recoverFromError', { client });
	}
}
