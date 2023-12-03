import { ExtendedPrismaClient, getExtendedPrismaClient, WebhookType } from '@luferro/database';
import { AnimeScheduleApi, GamingApi, MangadexApi, TMDBApi } from '@luferro/entertainment-api';
import { RedditApi } from '@luferro/reddit-api';
import { Scraper } from '@luferro/scraper';
import { DateUtil, logger, ObjectUtil } from '@luferro/shared-utils';
import { CronJob } from 'cron';
import { Client, ClientOptions, Collection, Embed, EmbedBuilder, Events, Guild, Message } from 'discord.js';
import { GuildQueueEvent, GuildQueueEvents, Player } from 'discord-player';
import i18next from 'i18next';

import { getSanitizedConfig, SanitizedConfig } from '../config/environment';
import * as CommandsHandler from '../handlers/commands';
import * as EventsHandler from '../handlers/events';
import * as JobsHandler from '../handlers/jobs';
import { getInitConfig } from '../helpers/i18n';
import { initializeLeopard, initializePorcupine, initializeRhino, initializeTextToSpeech } from '../helpers/speech';
import type { Api, Commands, Event, Job, Speech } from '../types/bot';
import { Cache } from './Cache';

type MessageType = string | EmbedBuilder;
type WebhookArgs = { guild: Guild; type: WebhookType };
type PropagateArgs = {
	type: WebhookType;
	cache?: boolean;
	everyone?: boolean;
	fields?: string[];
	messages: MessageType[];
};

export class Bot extends Client {
	private static readonly MAX_EMBEDS_CHUNK_SIZE = 10;
	static readonly ROLES_MESSAGE_ID = 'CLAIM_YOUR_ROLES';

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Commands = { voice: new Collection(), interactions: { metadata: [], methods: new Collection() } };

	api: Api;
	scraper: Scraper;
	cache: Cache;
	prisma: ExtendedPrismaClient;
	player: Player;
	speech: Speech;
	config: SanitizedConfig;

	constructor(options: ClientOptions) {
		super(options);
		this.cache = new Cache();
		this.scraper = new Scraper();
		this.prisma = getExtendedPrismaClient();
		this.config = getSanitizedConfig();
		this.api = this.initializeApi();
		this.speech = this.initializeSpeech();
		this.player = this.initializePlayer();
	}

	private initializeApi() {
		return {
			reddit: new RedditApi(),
			mangadex: new MangadexApi(),
			shows: new TMDBApi({ apiKey: this.config.THE_MOVIE_DB_API_KEY }),
			anime: new AnimeScheduleApi({ apiKey: this.config.ANIME_SCHEDULE_API_KEY }),
			gaming: new GamingApi({
				igdb: { clientId: this.config.IGDB_CLIENT_ID, clientSecret: this.config.IGDB_CLIENT_SECRET },
				deals: { apiKey: this.config.ITAD_API_KEY },
				steam: { apiKey: this.config.STEAM_API_KEY },
				xbox: { apiKey: this.config.XBOX_API_KEY },
			}),
		};
	}

	private initializeSpeech() {
		return {
			tts: initializeTextToSpeech(),
			sti: initializeRhino({ apiKey: this.config.PICOVOICE_API_KEY }),
			stt: initializeLeopard({ apiKey: this.config.PICOVOICE_API_KEY }),
			wake: initializePorcupine({ apiKey: this.config.PICOVOICE_API_KEY }),
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
			const callback = (...args: unknown[]) =>
				execute({ client: this, rest: args }).catch((error) => {
					this.emit('clientError', error);
				});

			const isDiscordEvent = ObjectUtil.enumToArray(Events).some((key) => Events[key] === name);
			const isPlayerEvent = ObjectUtil.enumToArray(GuildQueueEvent).some((key) => GuildQueueEvent[key] === name);
			const isClientEvent = isDiscordEvent || (!isDiscordEvent && !isPlayerEvent);

			if (isClientEvent) this[data.type](name, callback);
			else this.player.events[data.type](name as keyof GuildQueueEvents, callback);

			logger.info(`**${isClientEvent ? 'Client' : 'Player'}** is listening ${data.type} **${name}**.`);
		}
	}

	private initializeSchedulers() {
		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () =>
				job.execute({ client: this }).catch((error) => {
					error.message = `Job **${name}** failed. Reason: ${error.message}`;
					this.emit('clientError', error);
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
			if (i18next.resolvedLanguage) DateUtil.setI18nLocale(i18next.resolvedLanguage);

			await this.login(this.config.BOT_TOKEN);
			await JobsHandler.registerJobs();
			await EventsHandler.registerEvents();
			await CommandsHandler.registerCommands();

			this.initializeListeners();
			this.initializeSchedulers();

			this.emit('ready', this as Client<true>);
		} catch (error) {
			logger.error('Fatal error during application start.', error);
			this.stop();
		}
	}

	async webhook({ guild, type }: WebhookArgs) {
		const settings = await this.prisma.guild.findUnique({ where: { id: guild.id } });
		const webhook = settings?.webhooks.find((webhook) => webhook.type === type);
		if (!webhook) return null;

		const guildWebhooks = await guild.fetchWebhooks();
		if (!guildWebhooks.has(webhook.id)) {
			await this.prisma.guild.update({
				where: { id: guild.id },
				data: { webhooks: { deleteMany: { where: { type } } } },
			});
			return null;
		}

		return await this.fetchWebhook(webhook.id, webhook.token);
	}

	async propagate({ type, cache = true, everyone = false, fields = ['url'], messages }: PropagateArgs) {
		const allMessages = cache
			? (
					await Promise.all(
						messages.map(async (message) => {
							const isEmbed = message instanceof EmbedBuilder;
							const stringifiedMessage = isEmbed
								? JSON.stringify({ ...message.data, color: null })
								: message;

							const hash = this.cache.createHash(stringifiedMessage);
							if (await this.cache.persistent.exists(hash)) return;

							await this.cache.persistent.set(hash, stringifiedMessage, 'EX', 60 * 60 * 24 * 30);
							return message;
						}),
					)
			  ).filter((item): item is NonNullable<(typeof messages)[0]> => !!item)
			: messages;

		const filter = <T>(message: T) => message instanceof EmbedBuilder;
		const [embeds, contents] = ObjectUtil.partition<MessageType, EmbedBuilder>(allMessages, filter);

		const isMatch = <T extends object>(obj1: T, obj2: T) => ObjectUtil.hasCommonFields(fields, obj1, obj2);

		for (const { 1: guild } of this.guilds.cache) {
			const webhook = await this.webhook({ guild, type });
			const channel = webhook?.channel;
			if (!webhook || !channel) continue;

			for (const data of [...contents, ...ObjectUtil.splitIntoChunks(embeds, Bot.MAX_EMBEDS_CHUNK_SIZE)]) {
				if (Array.isArray(data)) {
					const content = everyone ? `${guild.roles.everyone}` : undefined;

					const cachedMessage = channel.messages.cache.find((message) =>
						data.some((embed) => message.embeds.some((cached) => isMatch(embed.data, cached.data))),
					);

					if (!cachedMessage) {
						const message = await webhook.send({ content, embeds: data });
						webhook.channel.messages.cache.set(message.id, message as Message<true>);
						continue;
					}

					const { embeds } = cachedMessage;
					for (const embed of data) {
						const index = embeds.findIndex((cachedEmbed) => isMatch(embed.data, cachedEmbed.data));
						if (index !== -1) embeds[index] = embed.data as Embed;
					}

					const message = await webhook.editMessage(cachedMessage.id, { content, embeds });
					webhook.channel.messages.cache.set(message.id, message as Message<true>);
					continue;
				}

				await webhook.send({ content: everyone ? `${guild.roles.everyone}, ${data}` : data });
			}
		}
	}

	async stop() {
		await this.cache.persistent.quit();
		process.exit();
	}
}
