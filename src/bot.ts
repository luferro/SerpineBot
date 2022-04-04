import 'dotenv/config';
import { Client, ClientOptions, Collection } from 'discord.js';
import { CronJob } from 'cron';
import * as Database from './database/database';
import * as JobsHandler from './handlers/jobs';
import * as EventsHandler from './handlers/events';
import * as CommandsHandler from './handlers/commands';
import * as Environment from './utils/environment';
import { logger } from './utils/logger';
import { Command, Event, Job, Music } from './types/bot';
import { JobError } from './errors/jobError';
import { DatabaseError } from './errors/databaseError';
import { EnvironmentError } from './errors/environmentError';
import { stateModel } from './database/models/state';

export class Bot extends Client {
    public music: Collection<string, Music> = new Collection();
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public jobs: Collection<string, Job> = new Collection();

    constructor(options: ClientOptions) {
        super(options);
        Environment.scanVariables();
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
    }

    private register = async () => {
        await JobsHandler.register(this);
        await EventsHandler.register(this);
        await CommandsHandler.register(this);
    }

    private startListeners = () => {
        for(const [name, event] of this.events.entries()) {
            this[event.data.once ? 'once' : 'on'](name, async (...args: unknown[]) =>
                await event.execute(this, ...args).catch(this.errorHandler)
            );

            logger.info(`Event listener is listening ${event.data.once ? 'once' : 'on'} \`${name}\`.`);
        }
    }

    private startJobs = () => {
        for(const [name, job] of this.jobs.entries()) {
            const cronjob = new CronJob(job.data.schedule, async () =>
                await job.execute(this).catch(this.errorHandler)
            );
            cronjob.start();

            logger.info(`Job \`${name}\` is set to run using the following schedule expression: ${job.data.schedule}.`);
        }
    }

    public manageState = async (category: string, subcategory: string, title: string, url: string) => {
        const categoryState = await stateModel.findOne({ category });
        const stateEntries = categoryState?.entries.get(subcategory) ?? [];
        const hasEntry = stateEntries.some(item => item.title === title || item.url === url);

        if(!hasEntry) await stateModel.updateOne({ category }, { $set: { [`entries.${subcategory}`]: stateEntries.concat({ title, url }).slice(-100) } }, { upsert: true });

        return hasEntry || stateEntries.length === 0;
    }

    private errorHandler = (error: unknown) => {
        if(error instanceof JobError) return logger.warn(error.message);

        if(error instanceof EnvironmentError || error instanceof DatabaseError) {
            logger.fatal(error.message);
            return this.stop();
        }

        logger.error(error);
    }

    public stop = () => {
        logger.info('Stopping SerpineBot.');
        Database.disconnect();
        process.exit(1);
    }
}