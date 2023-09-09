import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import * as Leaderboards from '../../../utils/leaderboards';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.leaderboards.xbox.name'))
	.setDescription(t('interactions.leaderboards.xbox.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const leaderboard = await Leaderboards.getXboxLeaderboard(client);
	if (leaderboard.length === 0) throw new Error(t('errors.xbox.leaderboard.empty'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.leaderboards.xbox.embed.title'))
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: t('leaderboards.xbox.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
