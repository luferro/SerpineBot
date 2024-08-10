import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	StringSelectMenuInteraction,
} from "discord.js";
import type { Bot } from "~/structures/Bot.js";

type GenericInteraction<T> = { guild: Guild; member: GuildMember } & T;

export type ExtendedChatInputCommandInteraction = GenericInteraction<ChatInputCommandInteraction>;
export type ExtendedAutocompleteInteraction = GenericInteraction<AutocompleteInteraction>;
export type ExtendedStringSelectMenuInteraction = GenericInteraction<StringSelectMenuInteraction>;
export type ExtendedButtonInteraction = GenericInteraction<ButtonInteraction>;

export type ExtendedVoiceInteraction = GenericInteraction<{ intent: string; slots: Record<string, string> }>;

export type Interaction =
	| ExtendedChatInputCommandInteraction
	| ExtendedStringSelectMenuInteraction
	| ExtendedButtonInteraction;
