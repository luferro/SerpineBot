import 'dotenv/config';
import { Client, ClientOptions, Collection } from 'discord.js';
import { CronJob } from 'cron';
import * as Database from './database/database';
import * as JobsHandler from './handlers/jobs';
import * as EventsHandler from './handlers/events';
import * as CommandsHandler from './handlers/commands';
import * as EnvironmentUtil from './utils/environment';
import * as SleepUtil from './utils/sleep';
import { logger } from './utils/logger';
import { stateModel } from './database/models/state';
import { Command, Event, Job, Music } from './types/bot';
import { FetchError } from './errors/fetchError';
import { DatabaseError } from './errors/databaseError';
import { EnvironmentError } from './errors/environmentError';

export class Bot extends Client {
	public static music: Collection<string, Music> = new Collection();
	public static commands: Collection<string, Command> = new Collection();
	public static events: Collection<string, Event> = new Collection();
	public static jobs: Collection<string, Job> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
		EnvironmentUtil.scanVariables();
	}

	public start = async () => {
		logger.info('Starting SerpineBot.');

		try {
			await Database.connect();
			await this.login(process.env.BOT_TOKEN);
			await this.register();

			this.startListeners();
			this.startJobs();
		} catch (error) {
			this.errorHandler(error);
		}
	};

	private register = async () => {
		await JobsHandler.register();
		await EventsHandler.register();
		await CommandsHandler.register();
	};

	private startListeners = () => {
		for (const [name, event] of Bot.events.entries()) {
			const eventType = event.data.once ? 'once' : 'on';
			this[eventType](name, (...args: unknown[]) => event.execute(this, ...args).catch(this.errorHandler));

			logger.info(`Event listener is listening ${eventType} _*${name}*_.`);
		}
	};

	private startJobs = () => {
		for (const [name, job] of Bot.jobs.entries()) {
			const cronjob = new CronJob(job.data.schedule, () => job.execute(this).catch(this.errorHandler));
			cronjob.start();

			logger.info(`Job _*${name}*_ is running. Schedule expression: _*${job.data.schedule}*_.`);
		}
	};

	public manageState = async (category: string, subcategory: string, title: string, url: string) => {
		await SleepUtil.timeout(5000);

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

	private errorHandler = (error: unknown) => {
		const isFetchError = error instanceof FetchError;
		if (isFetchError) {
			logger.warn(error.message);
			return;
		}

		const isDatabaseError = error instanceof DatabaseError;
		const isEnvironmentError = error instanceof EnvironmentError;
		if (isDatabaseError || isEnvironmentError) this.stop();

		logger.error(error);
	};

	public stop = () => {
		logger.info('Stopping SerpineBot.');
		Database.disconnect();
		process.exit(1);
	};
}
