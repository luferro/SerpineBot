import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	StringSelectMenuInteraction,
} from 'discord.js';

export type Interaction = ExtendedChatInputCommandInteraction | ExtendedButtonInteraction;

export interface ExtendedChatInputCommandInteraction extends ChatInputCommandInteraction {
	guild: Guild;
	member: GuildMember;
}

export interface ExtendedButtonInteraction extends ButtonInteraction {
	guild: Guild;
	member: GuildMember;
}

export interface ExtendedStringSelectMenuInteraction extends StringSelectMenuInteraction {
	guild: Guild;
	member: GuildMember;
}
