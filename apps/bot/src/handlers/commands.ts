import type { Command } from '../types/bot';
import type { ApplicationCommandDataResolvable, Client } from 'discord.js';
import path from 'path';
import { Bot } from '../structures/bot';
import { FileUtil, logger } from '@luferro/shared-utils';

export const register = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../commands'));
	for (const file of files) {
		const command: Command = await import(`../commands/${file}`);
		Bot.commands.set(command.data.name, command);
	}

	logger.info(`Commands handler registered **${files.length}** command(s).`);
};

export const deploy = async (client: Client) => {
	for (const { 1: guild } of client.guilds.cache) {
		const commands = Bot.commands.map((command) =>
			command.data.slashCommand.toJSON(),
		) as ApplicationCommandDataResolvable[];

		const guildCommands = await guild.commands.set(commands);

		logger.info(`Commands handler deployed **${guildCommands.size}** slash command(s) to guild **${guild.name}**.`);
	}
};
