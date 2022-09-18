import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Prune,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Prune)
		.setDescription("Deletes the last N messages. Maximum of 100 messages and these can't be older than 2 weeks.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option.setName('quantity').setDescription('Quantity of messages to delete.').setRequired(true),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const quantity = interaction.options.getInteger('quantity', true);
	if (quantity < 2 || quantity > 100) throw new Error('Invalid quantity. Choose between 2 and 100 messages.');

	const channel = interaction.channel as TextChannel;
	const messages = await channel.bulkDelete(quantity, true);
	await interaction.reply({ content: `${messages.size} messages have been deleted.`, ephemeral: true });
};
