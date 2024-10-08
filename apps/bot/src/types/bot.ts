import type { AniListApi, MangadexApi } from "@luferro/animanga";
import type { TMDBApi } from "@luferro/entertainment";
import type { GamingApi } from "@luferro/gaming";
import type { RedditApi } from "@luferro/reddit";
import type { SpeechToIntentClient, SpeechToTextClient, TextToSpeechClient, WakeWordClient } from "@luferro/speech";
import type { GuildQueue } from "discord-player";
import type {
	ApplicationCommandOptionBase,
	Collection,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	TextChannel,
} from "discord.js";
import type { Bot } from "~/structures/Bot.js";
import type { ExtendedAutocompleteInteraction, ExtendedChatInputCommandInteraction } from "~/types/interaction.js";

type Client = { client: Bot };

export type MetadataBuilder = SlashCommandSubcommandBuilder | ApplicationCommandOptionBase;

type VoiceCommandArgs<T> = Client & { queue: GuildQueue<TextChannel>; slots: Record<string, string>; rest: T };
export type VoiceCommandExecute<T = unknown> = (args: VoiceCommandArgs<T>) => Promise<void>;
export type VoiceCommand = { execute: VoiceCommandExecute };

export type Localization = { locale: string; timezone: string };
export type BaseInteractionArgs<T> = Client & { interaction: T; localization: Localization };
type BaseInteraction<T> = (args: BaseInteractionArgs<T>) => Promise<void>;

export type InteractionCommandData = Exclude<MetadataBuilder, "SlashCommandOption"> | ApplicationCommandOptionBase[];
export type InteractionCommandExecute = BaseInteraction<ExtendedChatInputCommandInteraction>;
export type InteractionCommandAutoComplete = BaseInteraction<ExtendedAutocompleteInteraction>;
export type InteractionCommandMethods = {
	execute: InteractionCommandExecute;
	autocomplete?: InteractionCommandAutoComplete;
};
export type InteractionCommand = { data: InteractionCommandData; execute: InteractionCommandExecute };

export type Commands = {
	voice: Collection<string, VoiceCommand>;
	interactions: { metadata: SlashCommandBuilder[]; methods: Collection<string, InteractionCommandMethods> };
};

type EventArgs<T> = Client & { rest: T };
export type EventData = { listener: "discord" | "player" | "custom"; type: "on" | "once" };
export type EventExecute<T = void> = (args: EventArgs<T>) => Promise<void>;
export type Event = { data: EventData; execute: EventExecute<unknown[]> };

type JobArgs = Client;
export type JobData = { schedule: string };
export type JobExecute = (args: JobArgs) => Promise<void>;
export type Job = { data: JobData; execute: JobExecute };

export type Api = {
	aniList: AniListApi;
	mangadex: MangadexApi;
	gaming: GamingApi;
	reddit: RedditApi;
	shows: TMDBApi;
};

export type Speech = {
	wakeWord: WakeWordClient;
	speechToIntent: SpeechToIntentClient;
	speechToText: SpeechToTextClient;
	textToSpeech: TextToSpeechClient;
};
