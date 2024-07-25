import path from "node:path";
import { AniListApi, MangadexApi } from "@luferro/animanga";
import { RedisCache } from "@luferro/cache";
import { type Config, loadConfig } from "@luferro/config";
import { TMDBApi } from "@luferro/entertainment";
import { GamingApi } from "@luferro/gaming";
import { type Logger, configureLogger } from "@luferro/helpers/logger";
import { enumToArray, everyFieldExists, partition, someFieldExists, splitIntoChunks } from "@luferro/helpers/transform";
import { RedditApi } from "@luferro/reddit";
import { Scraper } from "@luferro/scraper";
import { SpeechToIntentClient, SpeechToTextClient, TextToSpeechClient, WakeWordClient } from "@luferro/speech";
import { CronJob } from "cron";
import { GuildQueueEvent, type GuildQueueEvents } from "discord-player";
import {
	Client,
	type ClientOptions,
	Collection,
	type Embed,
	EmbedBuilder,
	Events,
	type Message,
	type TextBasedChannel,
} from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as CommandsHandler from "~/handlers/commands.js";
import * as EventsHandler from "~/handlers/events.js";
import * as JobsHandler from "~/handlers/jobs.js";
import { Database, type ExtendedDatabase, type Feed, type FeedType } from "~/structures/Database.js";
import { Player } from "~/structures/Player.js";
import type { Api, Commands, Event, Job, Speech } from "~/types/bot.js";

type MessageType = string | EmbedBuilder;
type BasePropagateArgs = { type: FeedType; everyone?: boolean; messages: MessageType[] };
type PropagateToWebhookArgs = BasePropagateArgs & { webhookId: string };
type PropagateToGuildArgs = BasePropagateArgs & { guildId: string };
type PropagateInternalArgs = Omit<BasePropagateArgs, "type"> & { feeds: Feed[] };

export class Bot extends Client<boolean> {
	private static readonly MAX_EMBEDS_CHUNK_SIZE = 10;
	static readonly ROLES_MESSAGE_ID = "CLAIM_YOUR_ROLES";
	static readonly RESTRICTIONS_ROLE = "Restrictions";

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Commands = { voice: new Collection(), interactions: { metadata: [], methods: new Collection() } };

	config: Config;
	logger: Logger;
	cache: RedisCache;
	db: ExtendedDatabase;
	scraper: Scraper;
	player: Player;
	api: Api;
	speech: Speech;

	constructor(options: ClientOptions) {
		super(options);
		this.config = loadConfig();
		this.logger = configureLogger();
		this.cache = new RedisCache(this.config.get("services.redis.uri"));
		this.db = new Database(this.config.get("services.mongodb.uri")).withExtensions();
		this.scraper = new Scraper();
		this.player = new Player(this);
		this.api = this.initializeApi();
		this.speech = this.initializeSpeech();
	}

	private initializeApi() {
		return {
			mangadex: new MangadexApi(),
			aniList: new AniListApi().withAnimeScheduleApi(this.config.get("services.animeSchedule.apiKey")),
			shows: new TMDBApi(this.config.get("services.tmdb.apiKey")),
			reddit: new RedditApi(
				this.config.get("services.reddit.clientId"),
				this.config.get("services.reddit.clientSecret"),
			),
			gaming: new GamingApi({
				igdb: {
					clientId: this.config.get("services.igdb.clientId"),
					clientSecret: this.config.get("services.igdb.clientSecret"),
				},
				deals: { apiKey: this.config.get("services.itad.apiKey") },
				steam: { apiKey: this.config.get("services.steam.apiKey") },
				xbox: { apiKey: this.config.get("services.xbox.apiKey") },
			}),
		};
	}

	private initializeSpeech() {
		const apiKey = this.config.get<string>("services.picovoice.apiKey");
		return {
			wakeWord: new WakeWordClient(apiKey),
			speechToText: new SpeechToTextClient(apiKey, ""),
			speechToIntent: new SpeechToIntentClient(apiKey, ""),
			textToSpeech: new TextToSpeechClient(this.config.get("services.google.credentials.path")),
		};
	}

	private initializeListeners() {
		for (const [name, { data, execute }] of Bot.events.entries()) {
			const callback = (...args: unknown[]) =>
				execute({ client: this, rest: args }).catch((error) => {
					this.emit("clientError", error);
				});

			const isDiscordEvent = enumToArray(Events).some((key) => key === name);
			const isPlayerEvent = enumToArray(GuildQueueEvent).some((key) => key === name);
			const isClientEvent = isDiscordEvent || (!isDiscordEvent && !isPlayerEvent);

			if (isClientEvent) this[data.type](name, callback);
			else this.player.events[data.type](name as keyof GuildQueueEvents, callback);
			this.logger.info(`Events | ${isClientEvent ? "Client" : "Player"} ${data.type} ${name}`);
		}
	}

	private initializeSchedulers() {
		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () =>
				job.execute({ client: this }).catch((error) => {
					error.message = `Jobs | ${name} failed | Reason: ${error.message}`;
					this.emit("clientError", error);
				}),
			);
			cronjob.start();
			this.logger.info(`Jobs | ${name} scheduled (${job.data.schedule})`);
		}
	}

	async start() {
		this.logger.info(`Bot | Starting in ${this.config.runtimeEnvironment}`);

		try {
			await this.login(this.config.get("client.token"));
			await this.player.loadDependencies();
			await i18next.use(Backend).init({
				fallbackLng: "en-US",
				backend: { loadPath: path.join(import.meta.dirname, "../locales/{{lng}}.json") },
				interpolation: { escapeValue: false },
			});

			await JobsHandler.registerJobs(this);
			await EventsHandler.registerEvents(this);
			await CommandsHandler.registerCommands(this);

			this.initializeListeners();
			this.initializeSchedulers();

			this.emit("ready", this as Client<true>);
		} catch (error) {
			this.logger.fatal(error, "Bot | Fatal error during application start");
		}
	}

	async propagate({ type, ...rest }: BasePropagateArgs) {
		const feeds = await this.db.feeds.getFeeds({ type });
		return this.propagateInternal({ feeds, ...rest });
	}

	async propagateToGuild({ type, guildId, ...rest }: PropagateToGuildArgs) {
		const feeds = await this.db.feeds.getFeedsByGuildId({ type, guildId });
		return this.propagateInternal({ feeds, ...rest });
	}

	async propagateToWebhook({ type, webhookId, ...rest }: PropagateToWebhookArgs) {
		const feeds = await this.db.feeds.getFeedsByWebhookId({ type, webhookId });
		return this.propagateInternal({ feeds, ...rest });
	}

	private async propagateInternal({ feeds, everyone = false, messages }: PropagateInternalArgs) {
		const getMessages = async (cacheEnabled: boolean) => {
			if (!cacheEnabled) return messages;

			const filteredMessages = await Promise.all(
				messages.map(async (message) => {
					const data = message instanceof EmbedBuilder ? JSON.stringify({ ...message.data, color: null }) : message;
					const hash = this.cache.hash(data);
					const inCache = await this.cache.some(hash);
					if (inCache) return;

					await this.cache.set(hash, data);
					return message;
				}),
			);
			return filteredMessages.filter((item): item is NonNullable<MessageType> => !!item);
		};

		for (const { guildId, channelId, cache, webhook } of feeds) {
			const guildWebhook = await this.fetchWebhook(webhook.id, webhook.token);
			const guild = this.guilds.cache.find((guild) => guild.id === guildId);
			const channel = guild?.channels.cache.find((channel) => channel.id === channelId) as TextBasedChannel;
			if (!guildWebhook || !guild || !channel) continue;

			const [embeds, contents] = partition<MessageType, EmbedBuilder, string>(
				await getMessages(cache.enabled),
				(message: MessageType) => message instanceof EmbedBuilder,
			);

			for (const chunk of [...contents, ...splitIntoChunks(embeds, Bot.MAX_EMBEDS_CHUNK_SIZE)]) {
				if (typeof chunk === "string") {
					await guildWebhook.send({ content: everyone ? `${guild.roles.everyone}, ${chunk}` : chunk });
					continue;
				}

				const content = everyone ? `${guild.roles.everyone}` : undefined;
				const exists = cache.fields.includes("description") ? everyFieldExists : someFieldExists;

				const cached = channel.messages.cache.find((message) =>
					chunk.some((embed) => message.embeds.some((cached) => exists(cache.fields, embed.data, cached.data))),
				);
				if (!cached) {
					const message = await guildWebhook.send({ content, embeds: chunk });
					channel.messages.cache.set(message.id, message as Message<true>);
					continue;
				}

				for (const { data } of chunk) {
					const index = cached.embeds.findIndex((embed) => exists(cache.fields, data, embed.data));
					if (index !== -1) cached.embeds[index] = data as Embed;
				}

				const message = await guildWebhook.editMessage(cached.id, { content, embeds: cached.embeds });
				channel.messages.cache.set(message.id, message as Message<true>);
			}
		}
	}

	getLocalization() {
		return {
			locale: this.config.get<string>("locale"),
			timezone: this.config.get<string>("timezone"),
		};
	}

	async stop() {
		try {
			await this.cache.quit();
			this.logger.info("Bot | Stopping");
		} finally {
			process.exit();
		}
	}
}
