import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '@luferro/shared-utils';
import { Bot } from '../structures/bot';
import { CommandName, EventName } from '../types/enums';

export const data = {
	name: EventName.InteractionCreate,
	type: 'on',
};

export const execute = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const isCommand = interaction.isChatInputCommand();
	const isGuildAvailable = interaction.guild?.available;
	if (!isCommand || !isGuildAvailable) return;

	const command = Bot.commands.get(interaction.commandName as CommandName);
	if (!command) return;

	const userTag = interaction.user.tag;
	const guildName = interaction.guild.name;
	const interactionName = `/${interaction.commandName} ${interaction.options.getSubcommand(false) ?? ''}`.trim();
	logger.info(`User **${userTag}** used interaction **${interactionName}** in guild **${guildName}**.`);

	try {
		if (command.data.isClientRequired) return await command.execute(client, interaction);
		await command.execute(interaction);
	} catch (error) {
		if (interaction.replied) throw error;
		await interaction.reply({ content: (error as Error).message, ephemeral: true });
	}
};
