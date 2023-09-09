import { SlashCommandIntegerOption, TextChannel } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../types/bot';

export const data: InteractionCommandData = [
	new SlashCommandIntegerOption()
		.setName(t('interactions.prune.options.0.name'))
		.setDescription(t('interactions.prune.options.0.description'))
		.setMinValue(2)
		.setMaxValue(100)
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const quantity = interaction.options.getInteger(t('interactions.prune.options.0.name'), true);

	const messages = await (interaction.channel as TextChannel).bulkDelete(quantity, true);

	await interaction.reply({
		content: t('prune.embed.title', { deleted: messages.size, ignored: quantity - messages.size }),
		ephemeral: true,
	});
};
