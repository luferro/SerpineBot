import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../bot';
import { CommandName, EventName, JobName, WebhookJobName } from './enums';

export interface Command {
	data: {
		name: CommandName;
		slashCommand: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
		client: boolean;
	};
	execute(integration: ChatInputCommandInteraction): Promise<void>;
	execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface Event {
	data: {
		name: EventName;
		once: boolean;
	};
	execute(...args: unknown[]): Promise<void>;
}

export interface Job {
	data: {
		name: JobName | WebhookJobName;
		schedule: string | Date;
	};
	execute(...args: unknown[]): Promise<void>;
}

export interface QueueItem {
	title: string;
	channel: string;
	thumbnail: string;
	url: string;
	duration: string;
	isLivestream: boolean;
	playlist?: {
		title: string;
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
