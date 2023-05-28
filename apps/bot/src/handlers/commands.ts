import { FileUtil, logger } from '@luferro/shared-utils';
import {
	Client,
	PermissionFlagsBits,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import path from 'path';

import { config } from '../config/environment';
import { Bot } from '../structures/Bot';
import type { CommandData, CommandExecute, MetadataBuilder } from '../types/bot';

type RawCommand = { data: CommandData; execute: CommandExecute };

const getBasicMetadata = (name: string) => {
	const options: Record<string, { permissions: bigint | null; description: string }> = {
		'birthdays': {
			permissions: null,
			description: 'Manage your birthday entry.',
		},
		'channels': {
			permissions: PermissionFlagsBits.ManageChannels,
			description: 'Manage guild text / voice channels and assign / unassign bot messages to text channels.',
		},
		'comics': {
			permissions: null,
			description: 'Random comic page.',
		},
		'gaming': {
			permissions: null,
			description:
				'Manage your gaming integrations, check out deals, average playtime, leaderboards and much more.',
		},
		'memes': {
			permissions: null,
			description: 'Random meme.',
		},
		'music': {
			permissions: null,
			description: 'Manage music playback.',
		},
		'prune': {
			permissions: PermissionFlagsBits.ManageMessages,
			description: 'Deletes the last N messages, ignoring messages older than 2 weeks.',
		},
		'reminders': {
			permissions: null,
			description: 'Manage your reminders.',
		},
		'roles': {
			permissions: PermissionFlagsBits.ManageRoles,
			description: 'Manage guild roles.',
		},
		'secret-santa': {
			permissions: null,
			description: 'Organize a secret-santa',
		},
		'shows': {
			permissions: null,
			description: 'Lookup movies and series.',
		},
		'webhooks': {
			permissions: PermissionFlagsBits.ManageWebhooks,
			description: 'Manage guild webhooks.',
		},
		'youtube': {
			permissions: null,
			description: 'Get the Youtube URL that matches your query.',
		},
	};
	return options[name] ?? { permissions: PermissionFlagsBits.Administrator, description: 'Command description.' };
};

export const registerCommands = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../commands'));

	const metadata = new Map<string, Map<string, MetadataBuilder[]>>();
	for (const file of files) {
		const content = file.split('commands')[1];
		const matches = content.match(/(?!\\)(.*?)(?=(\\|\.))/g)?.filter((match) => match);
		if (!matches) continue;

		if (matches.length > 3) {
			logger.warn(`Structure for command **${file}** is not supported. Ignoring it...`);
			continue;
		}

		const [command] = matches;
		const group = matches.length === 3 ? matches.at(-2) : null;
		const subcommand = matches.length > 1 ? matches.at(-1) : null;

		const { data, execute }: RawCommand = await import(file);

		const options = Array.isArray(data) ? data : [data];

		const category = group ?? command;
		const storedMetadata = metadata.get(command);
		if (storedMetadata) storedMetadata.get(category)?.push(...options) ?? storedMetadata.set(category, options);
		else metadata.set(command, new Map([[category, options]]));

		const name = group ? `${command}.${group}.${subcommand}` : subcommand ? `${command}.${subcommand}` : command;
		Bot.commands.execute.set(name, execute);
	}

	logger.info(`Commands handler registered **${files.length}** command(s).`);

	buildSlashCommands(metadata);
};

const buildSlashCommands = (map: Map<string, Map<string, CommandData[]>>) => {
	for (const [name, metadata] of map.entries()) {
		const { description, permissions } = getBasicMetadata(name);

		const command = new SlashCommandBuilder()
			.setName(name)
			.setDescription(description)
			.setDefaultMemberPermissions(permissions);

		for (const [category, options] of metadata.entries()) {
			const builder =
				name === category
					? command
					: new SlashCommandSubcommandGroupBuilder()
							.setName(category)
							.setDescription(`${category} group commands.`);

			for (const option of options) {
				if (option instanceof SlashCommandSubcommandBuilder) builder.addSubcommand(option);

				if (builder instanceof SlashCommandSubcommandGroupBuilder) continue;
				if (option instanceof SlashCommandStringOption) builder.addStringOption(option);
				if (option instanceof SlashCommandIntegerOption) builder.addIntegerOption(option);
			}

			if (builder instanceof SlashCommandSubcommandGroupBuilder) command.addSubcommandGroup(builder);
		}

		Bot.commands.metadata.push(command);
	}

	logger.info(`Command handler built **${map.size}** slash command(s).`);
};

export const deployCommands = async (client: Client) => {
	const commands = Bot.commands.metadata.map((metadata) => metadata.toJSON());

	if (config.NODE_ENV !== 'PRODUCTION') return await deployGuildCommands(client, commands);

	await deployGuildCommands(client, []);
	await deployGlobalCommands(client, commands);
};

const deployGuildCommands = async (client: Client, commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) => {
	for (const { 1: guild } of client.guilds.cache) {
		const guildCommands = await guild.commands.set(commands);
		if (guildCommands.size === 0) continue;
		logger.info(`Commands handler deployed **${guildCommands.size}** slash command(s) to guild **${guild.name}**.`);
	}
};

const deployGlobalCommands = async (client: Client, commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) => {
	if (!client.application) throw new Error('Not a client application.');
	const globalCommands = await client.application.commands.set(commands);
	logger.info(`Commands handler deployed **${globalCommands.size}** slash command(s) globally.`);
};
