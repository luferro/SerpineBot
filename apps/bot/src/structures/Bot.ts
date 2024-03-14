import path from "node:path";
import { AniListApi, MangadexApi } from "@luferro/animanga";
import { Cache } from "@luferro/cache";
import { type Config, loadConfig } from "@luferro/config";
import { DatabaseClient, type ExtendedDatabaseClient, WebhookType } from "@luferro/database";
import { TMDBApi } from "@luferro/entertainment";
import { GamingApi } from "@luferro/gaming";
import { RedditApi } from "@luferro/reddit";
import { Scraper } from "@luferro/scraper";
import { LoggerUtil, ObjectUtil } from "@luferro/shared-utils";
import { SpeechToIntentClient, SpeechToTextClient, TextToSpeechClient, WakeWordClient } from "@luferro/speech";
import { CronJob } from "cron";
import { GuildQueueEvent, GuildQueueEvents } from "discord-player";
import { Client, ClientOptions, Collection, Embed, EmbedBuilder, Events, Guild, Message } from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as CommandsHandler from "../handlers/commands";
import * as EventsHandler from "../handlers/events";
import * as JobsHandler from "../handlers/jobs";
import type { Api, Commands, Event, Job, Speech } from "../types/bot";
import { Player } from "./Player";

type MessageType = string | EmbedBuilder;
type WebhookArgs = { guild: Guild; type: WebhookType };
type PropagateArgs = { type: WebhookType; everyone?: boolean; messages: MessageType[] };

export class Bot extends Client {
	private static readonly MAX_EMBEDS_CHUNK_SIZE = 10;
	static readonly ROLES_MESSAGE_ID = "CLAIM_YOUR_ROLES";
	static readonly RESTRICTIONS_ROLE = "Restrictions";

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Commands = { voice: new Collection(), interactions: { metadata: [], methods: new Collection() } };

	config: Config;
	logger: LoggerUtil.Logger;
	cache: Cache;
	prisma: ExtendedDatabaseClient;
	scraper: Scraper;
	player: Player;
	api: Api;
	speech: Speech;

	constructor(options: ClientOptions) {
		super(options);
		this.config = loadConfig();
		this.logger = LoggerUtil.configureLogger();
		this.cache = new Cache(this.config.get("services.redis.uri"));
		this.prisma = new DatabaseClient(this.config.get("services.mongodb.uri")).withExtensions();
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

			const isDiscordEvent = ObjectUtil.enumToArray(Events).some((key) => Events[key] === name);
			const isPlayerEvent = ObjectUtil.enumToArray(GuildQueueEvent).some((key) => GuildQueueEvent[key] === name);
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
					error.message = `Jobs | **${name}** failed | Reason: ${error.message}`;
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
			i18next.use(Backend).init({
				fallbackLng: "en-US",
				backend: { loadPath: path.join(__dirname, "../locales/{{lng}}.json") },
				interpolation: { escapeValue: true },
			});

			await this.login(this.config.get("client.token"));
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

	async getWebhook({ guild, type }: WebhookArgs) {
		const settings = await this.prisma.guild.findUnique({ where: { id: guild.id } });
		const storedWebhook = settings?.webhooks.find((webhook) => webhook.type === type);
		if (!storedWebhook) return {};

		const guildWebhooks = await guild.fetchWebhooks();
		if (!guildWebhooks.has(storedWebhook.id)) {
			await this.prisma.guild.update({
				where: { id: guild.id },
				data: { webhooks: { deleteMany: { where: { type } } } },
			});
			return {};
		}

		return {
			webhook: await this.fetchWebhook(storedWebhook.id, storedWebhook.token),
			config: { fields: storedWebhook.fields, cache: storedWebhook.cache },
		};
	}

	async propagate({ type, everyone = false, messages }: PropagateArgs) {
		const getMessages = async (shouldBeCached: boolean) => {
			if (!shouldBeCached) return messages;

			const filteredMessages = await Promise.all(
				messages.map(async (message) => {
					const isEmbed = message instanceof EmbedBuilder;
					const stringifiedMessage = isEmbed ? JSON.stringify({ ...message.data, color: null }) : message;

					const hash = this.cache.hash(stringifiedMessage);
					if (await this.cache.some(hash)) return;

					await this.cache.set(hash, stringifiedMessage);
					return message;
				}),
			);
			return filteredMessages.filter((item): item is NonNullable<MessageType> => !!item);
		};

		for (const { 1: guild } of this.guilds.cache) {
			const { webhook, config } = await this.getWebhook({ guild, type });
			const channel = webhook?.channel;
			if (!webhook || !channel) continue;

			const commonFields = config.fields.includes("description")
				? ObjectUtil.everyFieldExists
				: ObjectUtil.someFieldExists;

			const [embeds, contents] = ObjectUtil.partition<MessageType, EmbedBuilder>(
				await getMessages(config.cache),
				(message: MessageType) => message instanceof EmbedBuilder,
			);

			for (const data of [...contents, ...ObjectUtil.splitIntoChunks(embeds, Bot.MAX_EMBEDS_CHUNK_SIZE)]) {
				if (Array.isArray(data)) {
					const content = everyone ? `${guild.roles.everyone}` : undefined;

					const cachedMessage = channel.messages.cache.find((message) =>
						data.some((embed) => message.embeds.some((cached) => commonFields(config.fields, embed.data, cached.data))),
					);
					if (!cachedMessage) {
						const message = await webhook.send({ content, embeds: data });
						webhook.channel.messages.cache.set(message.id, message as Message<true>);
						continue;
					}

					const { embeds } = cachedMessage;
					for (const embed of data) {
						const index = embeds.findIndex((cachedEmbed) => commonFields(config.fields, embed.data, cachedEmbed.data));
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
