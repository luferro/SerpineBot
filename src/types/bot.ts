import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { Bot } from '../bot';

export interface Command {
	data: {
		name: string;
		slashCommand: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
		client: boolean;
	};
	execute(integration: CommandInteraction): Promise<void>;
	execute(client: Bot, interaction: CommandInteraction): Promise<void>;
}

export interface Event {
	data: {
		name: string;
		once: boolean;
	};
	execute(...args: unknown[]): Promise<void>;
}

export interface Job {
	data: {
		name: string;
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
