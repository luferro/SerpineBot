import { ComicsApi } from '@luferro/comics-api';
import { Database, Webhook } from '@luferro/database';
import { GamingApi } from '@luferro/gaming-api';
import { GoogleApi } from '@luferro/google-api';
import { NewsApi } from '@luferro/news-api';
import { RedditApi } from '@luferro/reddit-api';
import { ArrayUtil, FetchError, logger } from '@luferro/shared-utils';
import { ShowsApi } from '@luferro/shows-api';
import { CronJob } from 'cron';
import { ClientOptions } from 'discord.js';
import { Client, Collection, EmbedBuilder } from 'discord.js';
import { Player } from 'discord-player';

import { config } from '../config/environment';
import * as CommandsHandler from '../handlers/commands';
import * as EventsHandler from '../handlers/events';
import * as JobsHandler from '../handlers/jobs';
import type { Api, Command, Event, Job } from '../types/bot';
import { Settings } from './settings/Settings';
import { State } from './state/State';

export class Bot extends Client {
	private static readonly MAX_EMBEDS_SIZE = 10;

	static jobs: Collection<string, Job> = new Collection();
	static events: Collection<string, Event> = new Collection();
	static commands: Command = { metadata: [], execute: new Collection() };

	api: Api;
	state: State;
	player: Player;
	settings: Settings;

	constructor(options: ClientOptions) {
		super(options);
		this.state = new State();
		this.settings = new Settings(this);
		this.api = this.initializeApis();
		this.player = this.initializePlayer();
	}

	async start() {
		logger.info(`Starting SerpineBot in **${config.NODE_ENV}**.`);

		try {
			await this.login(config.BOT_TOKEN);
			await Database.connect(config.MONGO_URI);
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

	async propageMessage(category: Webhook, content: string) {
		for (const { 1: guild } of this.guilds.cache) {
			const webhook = await this.settings.webhook().withGuild(guild).get({ category });
			if (!webhook) continue;

			await webhook.send({ content });
		}
	}

	async propageMessages(category: Webhook, embeds: EmbedBuilder[]) {
		for (const { 1: guild } of this.guilds.cache) {
			const webhook = await this.settings.webhook().withGuild(guild).get({ category });
			if (!webhook) continue;

			const chunks = ArrayUtil.splitIntoChunks(embeds, Bot.MAX_EMBEDS_SIZE);
			for (const chunk of chunks) {
				await webhook.send({ embeds: chunk });
			}
		}
	}

	stop() {
		logger.info('Stopping SerpineBot.');
		Database.disconnect();
		process.exit(1);
	}

	private initializeApis() {
		NewsApi.setApiKey(config.GNEWS_API_KEY);
		GamingApi.steam.setApiKey(config.STEAM_API_KEY);
		ShowsApi.tmdb.setApiKey(config.THE_MOVIE_DB_API_KEY);

		return {
			comics: ComicsApi,
			gaming: GamingApi,
			google: GoogleApi,
			news: NewsApi,
			reddit: RedditApi,
			shows: ShowsApi,
		};
	}

	private initializePlayer() {
		const player = new Player(this);
		player.extractors.loadDefault();
		player.events.on('error', (_queue, error) => logger.error('Player failed.', error));
		logger.debug(player.scanDeps());
		return player;
	}

	private initializeListeners() {
		for (const [name, event] of Bot.events.entries()) {
			this[event.data.type](name, (...args: unknown[]) => event.execute(this, ...args).catch(this.handleError));
			logger.info(`Event listener is listening ${event.data.type} **${name}**.`);
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

	private handleError(error: Error) {
		if (error instanceof FetchError) logger.warn(error);
		else logger.error(error);
	}
}
