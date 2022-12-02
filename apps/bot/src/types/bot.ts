import type { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { CommandName, EventName, JobName, WebhookName } from './enums';
import type { ExtendedChatInputCommandInteraction } from './interaction';

export interface CommandData {
	name: CommandName;
	slashCommand:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder;
}

export interface Command {
	data: CommandData;
	execute(integration: ExtendedChatInputCommandInteraction): Promise<void>;
}

export interface EventData {
	name: EventName;
	type: 'on' | 'once';
}

export interface Event {
	data: EventData;
	execute(...args: unknown[]): Promise<void>;
}

export interface JobData {
	name: JobName | WebhookName;
	schedule: string | Date;
}

export interface Job {
	data: JobData;
	execute(...args: unknown[]): Promise<void>;
}

export interface Alert {
	name: string;
	url: string;
	discount: number | null;
	regular: string | null;
	discounted: string | null;
	addedTo: string[];
	removedFrom: string[];
}

export interface QueueItem {
	title: string | null;
	channel: string | null;
	thumbnail: string | null;
	url: string;
	duration: string;
	isLivestream: boolean;
	playlist?: {
		title: string | null;
		url: string;
	};
	requested: string;
}

export interface Music {
	player: AudioPlayer;
	resource: AudioResource<null> | null;
	connection: VoiceConnection;
	playing: boolean;
	looping: boolean;
	queue: QueueItem[];
}
