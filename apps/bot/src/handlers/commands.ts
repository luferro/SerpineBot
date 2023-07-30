import { FileUtil, logger, StringUtil } from '@luferro/shared-utils';
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
import { resolve } from 'path';

import { Bot } from '../Bot';
import { InteractionCommandData, InteractionCommandExecute, MetadataBuilder, VoiceCommand } from '../types/bot';
import Metadata from './metadata.json';

type RawInteractionCommand = { data: InteractionCommandData; execute: InteractionCommandExecute };
type Key<T> = keyof T;

export const registerCommands = async () => {
	await registerVoiceCommands();
	await registerInteractionCommands();
};

const registerVoiceCommands = async () => {
	const files = FileUtil.getFiles(resolve(__dirname, '../commands/voice'));
	for (const file of files) {
		const name = FileUtil.getRelativePath(file, 'voice');
		if (!name) continue;

		const command: VoiceCommand = await import(file);
		Bot.commands.voice.set(name, command);
	}
	logger.info(`Commands handler registered **${files.length}** voice command(s).`);
};

const registerInteractionCommands = async () => {
	const files = FileUtil.getFiles(resolve(__dirname, '../commands/interactions'));

	const metadata = new Map<string, Map<string, MetadataBuilder[]>>();
	for (const file of files) {
		const name = FileUtil.getRelativePath(file, 'interactions');
		if (!name) continue;

		const { data, execute }: RawInteractionCommand = await import(file);
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

		Bot.commands.interactions.execute.set(name, execute);
	}
	logger.info(`Commands handler registered **${files.length}** interaction command(s).`);

	buildSlashCommands(metadata);
};

const buildSlashCommands = (map: Map<string, Map<string, InteractionCommandData[]>>) => {
	for (const [name, metadata] of map.entries()) {
		const { description, permissions } = Metadata[name as Key<typeof Metadata>] ?? {
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
							.setDescription(`${StringUtil.capitalize(category)} group commands for ${name}.`);

			for (const option of options) {
				const isSubcommand = option instanceof SlashCommandSubcommandBuilder;
				if (isSubcommand) builder.addSubcommand(option);

				const isSubcommandGroup = builder instanceof SlashCommandSubcommandGroupBuilder;
				if (isSubcommandGroup) continue;

				const isStringOption = option instanceof SlashCommandStringOption;
				if (isStringOption) builder.addStringOption(option);

				const isIntegerOption = option instanceof SlashCommandIntegerOption;
				if (isIntegerOption) builder.addIntegerOption(option);
			}

			const isSubcommandGroup = builder instanceof SlashCommandSubcommandGroupBuilder;
			if (isSubcommandGroup) command.addSubcommandGroup(builder);
		}

		Bot.commands.interactions.metadata.push(command);
	}
	logger.info(`Command handler built **${map.size}** slash command(s).`);
};

export const deployCommands = async (client: Bot) => {
	const commands = Bot.commands.interactions.metadata.map((metadata) => metadata.toJSON());

	if (client.config.NODE_ENV === 'PRODUCTION') {
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
