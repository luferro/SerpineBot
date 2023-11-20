import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import * as Leaderboards from '../../../helpers/leaderboards';
import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

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
		.setFooter({ text: t('interactions.leaderboards.xbox.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
