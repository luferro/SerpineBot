import type { Command, Event, Job, Music } from '../types/bot';
import type { CommandName, EventName, JobName, WebhookName } from '../types/enums';
import type { ClientOptions } from 'discord.js';
import { Client, Collection } from 'discord.js';
import { CronJob } from 'cron';
import { TenorApi } from '@luferro/tenor-api';
import { SteamApi } from '@luferro/games-api';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';
import { NewsDataApi } from '@luferro/news-data-api';
import { FetchError, logger, SleepUtil } from '@luferro/shared-utils';
import * as Database from '../database/database';
import * as JobsHandler from '../handlers/jobs';
import * as EventsHandler from '../handlers/events';
import * as CommandsHandler from '../handlers/commands';
import { stateModel } from '../database/models/state';
import { config } from '../config/environment';

export class Bot extends Client {
	public static music: Collection<string, Music> = new Collection();
	public static events: Collection<EventName, Event> = new Collection();
	public static commands: Collection<CommandName, Command> = new Collection();
	public static jobs: Collection<JobName | WebhookName, Job> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
		this.setApiTokens();
	}

	private setApiTokens = () => {
		TenorApi.setApiKey(config.TENOR_API_KEY);
		SteamApi.setApiKey(config.STEAM_API_KEY);
		NewsDataApi.setApiKey(config.NEWS_DATA_API_KEY);
		TheMovieDbApi.setApiKey(config.THE_MOVIE_DB_API_KEY);
	};

	private register = async () => {
		await JobsHandler.register();
		await EventsHandler.register();
		await CommandsHandler.register();
	};

	private startListeners = () => {
		for (const [name, event] of Bot.events.entries()) {
			this[event.data.type](name, (...args: unknown[]) => event.execute(this, ...args).catch(this.errorHandler));

			logger.info(`Event listener is listening ${event.data.type} **${name}**.`);
		}
	};

	private startJobs = () => {
		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () => job.execute(this).catch(this.errorHandler));
			cronjob.start();

			logger.info(`Job **${name}** is set to run. Schedule: **(${job.data.schedule})**.`);
		}
	};

	private errorHandler = (error: unknown) => {
		if (error instanceof FetchError) {
			logger.warn(error.message);
			return;
		}

		logger.error(error);
	};

	public start = async () => {
		logger.info('Starting SerpineBot.');

		try {
			await this.login(config.BOT_TOKEN);
			await Database.connect();
			await this.register();

			this.startListeners();
			this.startJobs();

			if (this.isReady()) this.emit('ready', this as Client<boolean>);
		} catch (error) {
			this.errorHandler(error);
		}
	};

	public manageState = async (category: string, subcategory: string, title: string, url: string) => {
		await SleepUtil.sleep(5000);

		const categoryState = await stateModel.findOne({ category });
		const stateEntries = categoryState?.entries.get(subcategory) ?? [];
		const hasEntry = stateEntries.some(
			({ title: stateTitle, url: stateUrl }) => stateTitle === title || stateUrl === url,
		);

		if (!hasEntry)
			await stateModel.updateOne(
				{ category },
				{ $set: { [`entries.${subcategory}`]: stateEntries.concat({ title, url }).slice(-100) } },
				{ upsert: true },
			);

		return hasEntry || stateEntries.length === 0;
	};

	public stop = () => {
		logger.info('Stopping SerpineBot.');
		Database.disconnect();
		process.exit(1);
	};
}
