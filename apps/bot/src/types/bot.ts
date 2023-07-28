import type { ComicsApi } from '@luferro/comics-api';
import type { GamingApi } from '@luferro/gaming-api';
import type { GoogleApi } from '@luferro/google-api';
import type { NewsApi } from '@luferro/news-api';
import type { RedditApi } from '@luferro/reddit-api';
import type { ShowsApi } from '@luferro/shows-api';
import { Leopard } from '@picovoice/leopard-node';
import { Porcupine } from '@picovoice/porcupine-node';
import type {
	Collection,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	User,
} from 'discord.js';

import type { Bot } from '../Bot';
import type { ExtendedChatInputCommandInteraction } from './interaction';

type CommandArgs = { client: Bot; interaction: ExtendedChatInputCommandInteraction };
type EventArgs<T> = Pick<CommandArgs, 'client'> & { rest: T };
type JobArgs = Pick<CommandArgs, 'client'>;

export type SlashCommandOption = SlashCommandStringOption | SlashCommandIntegerOption;
export type MetadataBuilder = SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOption;
export type CommandData = Exclude<MetadataBuilder, 'SlashCommandOption'> | SlashCommandOption[];
export type CommandExecute = { (args: CommandArgs): Promise<void> };
export type Command = { execute: Collection<string, CommandExecute>; metadata: SlashCommandBuilder[] };

export type EventData = { type: 'on' | 'once' };
export type EventExecute<T = void> = { (args: EventArgs<T>): Promise<void> };
export type Event = { data: EventData; execute: EventExecute<unknown[]> };

export type JobData = { schedule: string | Date };
export type JobExecute = { (args: JobArgs): Promise<void> };
export type Job = { data: JobData; execute: JobExecute };

export type Api = {
	comics: typeof ComicsApi;
	gaming: typeof GamingApi;
	google: typeof GoogleApi;
	news: typeof NewsApi;
	reddit: typeof RedditApi;
	shows: typeof ShowsApi;
};

export type Tools = {
	speechToText: Leopard;
	wakeWord: Porcupine;
};

export type Connection = {
	listeningTo: Collection<string, User>;
	config: {
		leaveOnEmpty: boolean;
		leaveOnEmptyCooldown: number;
		leaveOnEnd: boolean;
		selfDeaf: boolean;
		bufferingTimeout: number;
	};
};

export type Cache = {
	anime: { schedule: Collection<number, ShowsApi.animeschedule.WeeklySchedule> };
	deals: { chart: GamingApi.deals.PopularityChart[] };
};
