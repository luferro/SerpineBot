import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.integrations.xbox.delete.name'))
	.setDescription(t('interactions.integrations.xbox.delete.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const exists = await client.prisma.xbox.exists({ where: { userId: interaction.user.id } });
	if (!exists) throw new Error('errors.unprocessable');

	await client.prisma.xbox.delete({ where: { userId: interaction.user.id } });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.integrations.xbox.delete.embed.title'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
