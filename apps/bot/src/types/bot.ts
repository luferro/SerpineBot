import type { ComicsApi } from '@luferro/comics-api';
import type { GamingApi } from '@luferro/gaming-api';
import type { GoogleApi } from '@luferro/google-api';
import type { NewsApi } from '@luferro/news-api';
import type { RedditApi } from '@luferro/reddit-api';
import type { ShowsApi } from '@luferro/shows-api';
import type {
	Collection,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventName, JobName } from './enums';
import type { ExtendedChatInputCommandInteraction } from './interaction';

export type Args = { client: Bot; interaction: ExtendedChatInputCommandInteraction };

export type SlashCommandOption = SlashCommandStringOption | SlashCommandIntegerOption;
export type MetadataBuilder = SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOption;
export type CommandData = Exclude<MetadataBuilder, 'SlashCommandOption'> | SlashCommandOption[];
export type CommandExecute = { (args: Args): Promise<void> };
export type Command = { execute: Collection<string, CommandExecute>; metadata: SlashCommandBuilder[] };

export type EventData = { name: EventName; type: 'on' | 'once' };
export type EventExecute = { (...args: unknown[]): Promise<void> };
export type Event = { data: EventData; execute: EventExecute };

export type JobData = { name: JobName; schedule: string | Date };
export type JobExecute = { (args: Pick<Args, 'client'>): Promise<void> };
export type Job = { data: JobData; execute: JobExecute };

export type Api = {
	comics: typeof ComicsApi;
	gaming: typeof GamingApi;
	google: typeof GoogleApi;
	news: typeof NewsApi;
	reddit: typeof RedditApi;
	shows: typeof ShowsApi;
};
