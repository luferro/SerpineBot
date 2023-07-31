import type { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { ComicsApi } from '@luferro/comics-api';
import type { GamingApi } from '@luferro/gaming-api';
import type { GoogleApi } from '@luferro/google-api';
import type { NewsApi } from '@luferro/news-api';
import type { RedditApi } from '@luferro/reddit-api';
import type { ShowsApi } from '@luferro/shows-api';
import { Leopard } from '@picovoice/leopard-node';
import { Porcupine } from '@picovoice/porcupine-node';
import { Rhino } from '@picovoice/rhino-node';
import type {
	Collection,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	TextBasedChannel,
} from 'discord.js';
import { GuildQueue } from 'discord-player';

import type { Bot } from '../Bot';
import type { ExtendedChatInputCommandInteraction } from './interaction';

type Client = { client: Bot };

export type SlashCommandOption = SlashCommandStringOption | SlashCommandIntegerOption;
export type MetadataBuilder = SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOption;

type VoiceCommandArgs<T> = Client & { queue: GuildQueue<TextBasedChannel>; slots: Record<string, string>; rest: T };
export type VoiceCommandExecute<T = unknown> = { (args: VoiceCommandArgs<T>): Promise<void> };
export type VoiceCommand = { execute: VoiceCommandExecute };

type InteractionCommandArgs = Client & { interaction: ExtendedChatInputCommandInteraction };
export type InteractionCommandData = Exclude<MetadataBuilder, 'SlashCommandOption'> | SlashCommandOption[];
export type InteractionCommandExecute = { (args: InteractionCommandArgs): Promise<void> };
export type InteractionCommand = {
	metadata: SlashCommandBuilder[];
	execute: Collection<string, InteractionCommandExecute>;
};

export type Commands = { voice: Collection<string, VoiceCommand>; interactions: InteractionCommand };

type EventArgs<T> = Client & { rest: T };
export type EventData = { type: 'on' | 'once' };
export type EventExecute<T = void> = { (args: EventArgs<T>): Promise<void> };
export type Event = { data: EventData; execute: EventExecute<unknown[]> };

type JobArgs = Client;
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
	wakeWord: Porcupine;
	speechToIntent: Rhino;
	speechToText: Leopard;
	textToSpeech: TextToSpeechClient;
};

export type Connection = {
	lockedIn: Collection<string, boolean>;
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
