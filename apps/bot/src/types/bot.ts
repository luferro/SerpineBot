import type { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Bot } from '../structures/bot';
import type { CommandName, EventName, JobName, WebhookName } from './enums';

export interface Command {
	data: {
		name: CommandName;
		slashCommand: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
		isClientRequired: boolean;
	};
	execute(integration: ChatInputCommandInteraction): Promise<void>;
	execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface Event {
	data: {
		name: EventName;
		type: 'on' | 'once';
	};
	execute(...args: unknown[]): Promise<void>;
}

export interface Job {
	data: {
		name: JobName | WebhookName;
		schedule: string | Date;
	};
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
