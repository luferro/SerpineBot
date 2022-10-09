import type { PermissionsBitField } from 'discord.js';

export interface Choice {
	name: string;
}

export interface SubcommandOptions {
	type: number;
	name: string;
	description: string;
	choices: Choice[];
	required: boolean;
}

export interface CommandOptions {
	type: number;
	name: string;
	description: string;
	options: SubcommandOptions[];
	choices: Choice[];
	required: boolean;
}

export interface Command {
	name: string;
	description: string;
	options: CommandOptions[];
	defaultMemberPermissions: PermissionsBitField | null;
}
