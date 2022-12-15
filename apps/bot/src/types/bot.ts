import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { Bot } from '../structures/bot';
import type { CommandName, EventName, JobName, WebhookName } from './enums';
import type { ExtendedChatInputCommandInteraction } from './interaction';
import type { SteamWishlistItem } from './schemas';

export interface CommandData {
	name: CommandName;
	slashCommand:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder;
}

export interface CommandExecute {
	(args: { client: Bot; interaction: ExtendedChatInputCommandInteraction }): Promise<void>;
}

export interface Command {
	data: CommandData;
	execute: CommandExecute;
}

export interface EventData {
	name: EventName;
	type: 'on' | 'once';
}

export interface EventExecute {
	(...args: unknown[]): Promise<void>;
}

export interface Event {
	data: EventData;
	execute: EventExecute;
}

export interface JobData {
	name: JobName | WebhookName;
	schedule: string | Date;
}

export interface JobExecute {
	(...args: unknown[]): Promise<void>;
}

export interface Job {
	data: JobData;
	execute: JobExecute;
}

export interface SteamAlert extends SteamWishlistItem {
	addedTo?: string[];
	removedFrom?: string[];
}
