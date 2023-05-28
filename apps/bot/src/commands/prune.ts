import { SlashCommandIntegerOption, TextChannel } from 'discord.js';

import type { CommandData, CommandExecute } from '../types/bot';

export const data: CommandData = [
	new SlashCommandIntegerOption()
		.setName('quantity')
		.setDescription('Amount of messages to delete.')
		.setMinValue(2)
		.setMaxValue(100)
		.setRequired(true),
];

export const execute: CommandExecute = async ({ interaction }) => {
	const quantity = interaction.options.getInteger('quantity', true);

	const channel = interaction.channel;
	if (!(channel instanceof TextChannel)) throw new Error('Cannot prune messages in this channel.');

	const messages = await channel.bulkDelete(quantity, true);

	const content = `${messages.size} messages have been deleted. ${quantity - messages.size} messages were ignored.`;
	await interaction.reply({ content, ephemeral: true });
};
