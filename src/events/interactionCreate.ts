import { ChatInputCommandInteraction } from 'discord.js';
import { Bot } from '../bot';
import { CommandName, EventName } from '../types/enums';
import { logger } from '../utils/logger';

export const data = {
	name: EventName.InteractionCreate,
	once: false,
};

export const execute = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const isCommand = interaction.isChatInputCommand();
	const isGuildAvailable = interaction.guild?.available;
	if (!isCommand || !isGuildAvailable) return;

	const command = Bot.commands.get(interaction.commandName as CommandName);
	if (!command) return;

	const guildName = interaction.guild.name;
	const userTag = interaction.user.tag;
	const interactionName = `/${interaction.commandName} ${interaction.options.getSubcommand(false) ?? ''}`.trim();
	logger.info(`User _*${userTag}*_ used interaction _*${interactionName}*_ in guild _*${guildName}*_.`);

	try {
		if (command.data.client) return await command.execute(client, interaction);
		await command.execute(interaction);
	} catch (error) {
		if (interaction.replied) throw error;
		interaction.reply({ content: (error as Error).message, ephemeral: true });
	}
};
