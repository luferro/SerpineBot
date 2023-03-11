import { Connector, StateModel, WebhookCategory } from '@luferro/database';
import { SteamApi } from '@luferro/games-api';
import { GNewsApi } from '@luferro/gnews-api';
import { FetchError, logger, SleepUtil } from '@luferro/shared-utils';
import { TenorApi } from '@luferro/tenor-api';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';
import { CronJob } from 'cron';
import { ClientOptions, DiscordAPIError } from 'discord.js';
import { Client, Collection, EmbedBuilder } from 'discord.js';
import { Player } from 'discord-player';

import { config } from '../config/environment';
import * as CommandsHandler from '../handlers/commands';
import * as EventsHandler from '../handlers/events';
import * as JobsHandler from '../handlers/jobs';
import * as Webhooks from '../services/webhooks';
import type { Command, Event, Job } from '../types/bot';
import type { CommandName, EventName, JobName } from '../types/enums';

export class Bot extends Client {
	public player: Player;

	public static events: Collection<EventName, Event> = new Collection();
	public static commands: Collection<CommandName, Command> = new Collection();
	public static jobs: Collection<JobName, Job> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
		this.login(config.BOT_TOKEN);
		this.setApiTokens();
		this.player = this.initializePlayer();
	}

	public start = async () => {
		logger.info(`Starting SerpineBot in **${config.NODE_ENV}**.`);

		try {
			await Connector.connect(config.MONGO_URI);
			await JobsHandler.registerJobs();
			await EventsHandler.registerEvents();
			await CommandsHandler.registerCommands();

			this.initializeListeners();
			this.initializeSchedulers();

			this.emit('ready', this as Client);
		} catch (error) {
			const { message } = error as Error;
			logger.error(`Fatal error during application start. Reason: ${message}`);
			this.stop();
		}
	};

	public manageState = async (jobName: JobName, category: string | null, title: string, url: string) => {
		await SleepUtil.sleep(5000);

		const state = await StateModel.getStateByJobName(jobName);
		const lookup = category ?? 'default';
		const entries = state?.entries.get(lookup) ?? [];

		const hasEntry = entries.some((entry) => entry.title === title || entry.url === url);
		if (!hasEntry) await StateModel.createOrUpdateState(jobName, lookup, entries.concat({ title, url }));

		return { isDuplicated: hasEntry };
	};

	public sendWebhookMessageToGuilds = async (category: WebhookCategory, message: EmbedBuilder | string) => {
		for (const { 0: guildId } of this.guilds.cache) {
			const webhook = await Webhooks.getWebhook(this, guildId, category);
			if (!webhook) continue;

			await webhook.send(message instanceof EmbedBuilder ? { embeds: [message] } : { content: message });
		}
	};

	public stop = () => {
		logger.info('Stopping SerpineBot.');
		Connector.disconnect();
		process.exit(1);
	};

	private setApiTokens = () => {
		TenorApi.setApiKey(config.TENOR_API_KEY);
		SteamApi.setApiKey(config.STEAM_API_KEY);
		GNewsApi.setApiKey(config.GNEWS_API_KEY);
		TheMovieDbApi.setApiKey(config.THE_MOVIE_DB_API_KEY);
	};

	private initializePlayer = () => {
		const player = new Player(this);
		player.on('connectionError', (_queue, error) => logger.error(error));
		player.on('error', (_queue, error) => logger.error(error));
		return player;
	};

	private initializeListeners = () => {
		for (const [name, event] of Bot.events.entries()) {
			this[event.data.type](name, (...args: unknown[]) => event.execute(this, ...args).catch(this.handleError));

			logger.info(`Event listener is listening ${event.data.type} **${name}**.`);
		}
	};

	private initializeSchedulers = () => {
		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () =>
				job.execute(this).catch((error) => {
					error.message = `Job **${name}** failed. Reason: ${error.message}`;
					this.handleError(error);
				}),
			);
			cronjob.start();

			logger.info(`Job **${name}** is set to run. Schedule: **(${job.data.schedule})**.`);
		}
	};

	private handleError = (error: Error) => {
		if (error instanceof DiscordAPIError || error instanceof FetchError) logger.warn(error.message);
		else logger.error(error);
	};
}
