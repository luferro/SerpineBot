import { CommandInteraction } from 'discord.js';
import { Bot } from '../bot';
import { logger } from '../utils/logger';

export const data = {
	name: 'interactionCreate',
	once: false,
};

export const execute = async (client: Bot, interaction: CommandInteraction) => {
	if (!interaction.isCommand()) return;

	const command = Bot.commands.get(interaction.commandName);
	if (!command) return;

	const guildName = interaction.guild!.name;
	const interactionName = `/${interaction.commandName} ${interaction.options.getSubcommand(false) ?? ''}`.trim();

	logger.info(`User _*${interaction.user.tag}*_ used interaction _*${interactionName}*_ in guild _*${guildName}*_.`);

	if (command.data.client) return await command.execute(client, interaction);
	await command.execute(interaction);
};
