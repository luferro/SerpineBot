import { ApplicationCommandDataResolvable } from 'discord.js';
import path from 'path';
import { Bot } from '../bot';
import * as FilesUtil from '../utils/files';
import { Command } from '../types/bot';
import { logger } from '../utils/logger';

export const register = async () => {
	const files = FilesUtil.getFiles(path.resolve(__dirname, '../commands'));
	for (const file of files) {
		const command: Command = await import(`../commands/${file}`);
		Bot.commands.set(command.data.name, command);
	}

	logger.info(`Commands handler registered _*${files.length}*_ command(s).`);
};

export const deploy = async (client: Bot) => {
	for (const { 1: guild } of client.guilds.cache) {
		const slashCommands = Bot.commands.map((item) =>
			item.data.slashCommand.toJSON(),
		) as ApplicationCommandDataResolvable[];

		const guildCommands = await guild.commands.set(slashCommands);

		logger.info(`Commands handler deployed _*${guildCommands.size}*_ slash command(s) to guild _*${guild.name}*_.`);
	}
};
