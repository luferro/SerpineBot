import type { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { AnimeScheduleApi, GamingApi, MangadexApi, TMDBApi } from '@luferro/entertainment-api';
import type { NewsApi } from '@luferro/news-api';
import type { RedditApi } from '@luferro/reddit-api';
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
import type { ExtendedAutocompleteInteraction, ExtendedChatInputCommandInteraction } from './interaction';

type Client = { client: Bot };

export type SlashCommandOption = SlashCommandStringOption | SlashCommandIntegerOption;
export type MetadataBuilder = SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOption;

type VoiceCommandArgs<T> = Client & { queue: GuildQueue<TextBasedChannel>; slots: Record<string, string>; rest: T };
export type VoiceCommandExecute<T = unknown> = { (args: VoiceCommandArgs<T>): Promise<void> };
export type VoiceCommand = { execute: VoiceCommandExecute };

type InteractionCommandArgs<T> = Client & { interaction: T };
export type InteractionCommandData = Exclude<MetadataBuilder, 'SlashCommandOption'> | SlashCommandOption[];
type BaseInteractionCommandMethod<T> = { (args: InteractionCommandArgs<T>): Promise<void> };
export type InteractionCommandExecute = BaseInteractionCommandMethod<ExtendedChatInputCommandInteraction>;
export type InteractionCommandAutoComplete = BaseInteractionCommandMethod<ExtendedAutocompleteInteraction>;
export type InteractionCommandMethods = {
	execute: InteractionCommandExecute;
	autocomplete?: InteractionCommandAutoComplete;
};
export type InteractionCommand = {
	metadata: SlashCommandBuilder[];
	methods: Collection<string, InteractionCommandMethods>;
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

export type APIs = {
	anime: AnimeScheduleApi;
	mangadex: MangadexApi;
	gaming: GamingApi;
	news: NewsApi;
	reddit: RedditApi;
	shows: TMDBApi;
};

export type Tools = {
	wakeWord: Porcupine | null;
	speechToIntent: Rhino | null;
	speechToText: Leopard | null;
	textToSpeech: TextToSpeechClient;
};

export type Connection = {
	config: {
		leaveOnEmpty: boolean;
		leaveOnEmptyCooldown: number;
		leaveOnEnd: boolean;
		selfDeaf: boolean;
		bufferingTimeout: number;
	};
};

export type Cache = {
	anime: {
		schedule: Collection<number, Awaited<ReturnType<InstanceType<typeof AnimeScheduleApi>['getWeeklySchedule']>>>;
	};
};
