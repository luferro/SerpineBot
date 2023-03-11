import { FileUtil, logger } from '@luferro/shared-utils';
import type { Client, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import path from 'path';

import { config } from '../config/environment';
import { Bot } from '../structures/bot';
import type { Command } from '../types/bot';

export const registerCommands = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../commands'));
	for (const file of files) {
		const command: Command = await import(`../commands/${file}`);
		Bot.commands.set(command.data.name, command);
	}

	logger.info(`Commands handler registered **${files.length}** command(s).`);
};

export const deployCommands = async (client: Client) => {
	const commands = Bot.commands.map((command) => command.data.slashCommand.toJSON());

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
