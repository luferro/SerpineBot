import {
	AppleMusicExtractor,
	AttachmentExtractor,
	SpotifyExtractor,
	YouTubeExtractor,
} from '@discord-player/extractor';
import { ComicsApi } from '@luferro/comics-api';
import { Database, SettingsModel, StateModel, WebhookType } from '@luferro/database';
import { GamingApi } from '@luferro/gaming-api';
import { GoogleApi } from '@luferro/google-api';
import { NewsApi } from '@luferro/news-api';
import { RedditApi } from '@luferro/reddit-api';
import { ArrayUtil, EnumUtil, FetchError, logger, SleepUtil } from '@luferro/shared-utils';
import { ShowsApi } from '@luferro/shows-api';
import { Leopard } from '@picovoice/leopard-node';
import { BuiltinKeyword, Porcupine } from '@picovoice/porcupine-node';
import { CronJob } from 'cron';
import crypto from 'crypto';
import { Client, ClientOptions, Collection, EmbedBuilder, Events, Guild } from 'discord.js';
import { GuildQueueEvent, GuildQueueEvents, Player } from 'discord-player';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { getSanitizedEnvConfig } from './config/environment';
import * as CommandsHandler from './handlers/commands';
import * as EventsHandler from './handlers/events';
import * as JobsHandler from './handlers/jobs';
import type { AITools, Api, Cache, Command, Event, Job } from './types/bot';

type StateArgs = { title: string; url: string };
type WebhookArgs = { guild: Guild; category: WebhookType };
type PropageArgs = { category: WebhookType; content: string; embeds: EmbedBuilder[]; everyone?: boolean };

export class Bot extends Client {
	private static readonly MAX_EMBEDS_SIZE = 10;

	static readonly ROLES_MESSAGE_ID = 'CLAIM_YOUR_ROLES';

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Command = { metadata: [], execute: new Collection() };

	api: Api;
	cache: Cache;
	player: Player;
	ai: AITools;
	config: ReturnType<typeof getSanitizedEnvConfig>;

	constructor(options: ClientOptions) {
		super(options);
		this.config = getSanitizedEnvConfig();
		this.api = this.initializeApis();
		this.ai = this.initializeAITools();
		this.player = this.initializePlayer();
		this.cache = { anime: { schedule: new Collection() }, deals: { chart: [] } };
	}

	private initializeApis() {
		NewsApi.auth.setApiKey(this.config.GNEWS_API_KEY);
		GamingApi.steam.auth.setApiKey(this.config.STEAM_API_KEY);
		GamingApi.deals.auth.setApiKey(this.config.ITAD_API_KEY);
		ShowsApi.tmdb.auth.setApiKey(this.config.THE_MOVIE_DB_API_KEY);
		ShowsApi.animeschedule.auth.setApiKey(this.config.ANIME_SCHEDULE_API_KEY);

		return {
			comics: ComicsApi,
			gaming: GamingApi,
			google: GoogleApi,
			news: NewsApi,
			reddit: RedditApi,
			shows: ShowsApi,
		};
	}

	private initializeAITools() {
		const leopard = resolve('models\\leopard');
		const porcupine = resolve('models\\porcupine');

		const isCustomWakeWord = existsSync(`${porcupine}\\wake-word.ppn`);
		const wakeWord = isCustomWakeWord
			? `${porcupine}\\wake-word-${process.platform === 'win32' ? 'windows' : 'linux'}.ppn`
			: BuiltinKeyword.BUMBLEBEE;
		const wakeWordModel = isCustomWakeWord ? `${porcupine}\\model.pv` : undefined;

		return {
			wakeWord: new Porcupine(this.config.PICOVOICE_ACCESS_TOKEN, [wakeWord], [0.8], wakeWordModel),
			speechToText: new Leopard(this.config.PICOVOICE_ACCESS_TOKEN, { modelPath: `${leopard}\\model.pv` }),
		};
	}

	private initializePlayer() {
		const player = new Player(this);
		player.extractors.register(YouTubeExtractor, {});
		player.extractors.register(SpotifyExtractor, {});
		player.extractors.register(AppleMusicExtractor, {});
		player.extractors.register(AttachmentExtractor, {});
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

	private handlePlayerError = (client?: Bot) => {
		if (!client) return;
		for (const [guildId] of client.guilds.cache) {
			const queue = this.player.nodes.get(guildId);
			if (!queue) continue;

			queue.revive();
			if (queue.currentTrack || !queue.isEmpty()) queue.node.play();
		}
	};

	async start() {
		logger.info(`Starting SerpineBot in **${this.config.NODE_ENV.trim()}**.`);

		try {
			await this.login(this.config.BOT_TOKEN);
			await Database.connect(this.config.MONGO_URI);
			await JobsHandler.registerJobs();
			await EventsHandler.registerEvents();
			await CommandsHandler.registerCommands();

			this.initializeListeners();
			// this.initializeSchedulers();

			this.emit('ready', this as Client);
		} catch (error) {
			logger.error('Fatal error during application start.', error);
			this.stop();
		}
	}

	async state({ title, url }: StateArgs) {
		await SleepUtil.sleep(2000);
		const hash = crypto.createHash('sha256').update(JSON.stringify({ title, url })).digest('hex');
		return await StateModel.createEntry({ hash });
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

		const isWarning = isPlayerError || isFetchError;
		logger[isWarning ? 'warn' : 'error'](error);

		if (isPlayerError) this.handlePlayerError(client);
	}
}