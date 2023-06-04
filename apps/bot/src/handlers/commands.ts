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
import { getCategoryFromPath } from '../utils/filename';
import CommandsMetadata from './metadata/commands.json';

type RawCommand = { data: CommandData; execute: CommandExecute };
type Key<T> = keyof T;

export const registerCommands = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../commands'));

	const metadata = new Map<string, Map<string, MetadataBuilder[]>>();
	for (const file of files) {
		const name = getCategoryFromPath(file, 'commands');
		if (!name) continue;

		const { data, execute }: RawCommand = await import(file);
		const options = Array.isArray(data) ? data : [data];

		const matches = name.split('.');
		if (matches.length > 3) {
			logger.warn(`Structure for command **${name}** is not supported. Ignoring it...`);
			continue;
		}

		const [command] = matches;
		const group = matches.length === 3 ? matches.at(-2) : null;
		const category = group ?? command;
		const storedMetadata = metadata.get(command);
		if (storedMetadata) storedMetadata.get(category)?.push(...options) ?? storedMetadata.set(category, options);
		else metadata.set(command, new Map([[category, options]]));

		Bot.commands.execute.set(name, execute);
	}
	logger.info(`Commands handler registered **${files.length}** command(s).`);

	buildSlashCommands(metadata);
};

const buildSlashCommands = (map: Map<string, Map<string, CommandData[]>>) => {
	for (const [name, metadata] of map.entries()) {
		const { description, permissions } = CommandsMetadata[name as Key<typeof CommandsMetadata>] ?? {
			permissions: 'Administrator',
			description: 'Sample command description.',
		};

		const command = new SlashCommandBuilder()
			.setName(name)
			.setDescription(description)
			.setDefaultMemberPermissions(PermissionFlagsBits[permissions as Key<typeof PermissionFlagsBits>] ?? null);

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

	if (config.NODE_ENV === 'PRODUCTION') {
		await deployGuildCommands(client, []);
		await deployGlobalCommands(client, commands);
		return;
	}

	await deployGuildCommands(client, commands);
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
