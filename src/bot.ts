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
import { CommandName, EventName, JobName, WebhookJobName } from './types/enums';

export class Bot extends Client {
	public static music: Collection<string, Music> = new Collection();
	public static events: Collection<EventName, Event> = new Collection();
	public static commands: Collection<CommandName, Command> = new Collection();
	public static jobs: Collection<JobName | WebhookJobName, Job> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
		EnvironmentUtil.scanVariables();
	}

	public start = async () => {
		logger.info('Starting SerpineBot.');

		try {
			await this.login(process.env.BOT_TOKEN);
			await Database.connect();
			await this.register();

			this.startListeners();
			this.startJobs();

			if (this.isReady()) this.emit('ready', this as Client<boolean>);
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
		if (error instanceof FetchError) {
			logger.warn(error.message);
			return;
		}

		if (error instanceof DatabaseError || error instanceof EnvironmentError) this.stop();

		logger.error(error);
	};

	public stop = () => {
		logger.info('Stopping SerpineBot.');
		Database.disconnect();
		process.exit(1);
	};
}
