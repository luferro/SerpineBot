import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import * as Leaderboards from '../../../utils/leaderboards';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.leaderboards.steam.name'))
	.setDescription(t('interactions.leaderboards.steam.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const leaderboard = await Leaderboards.getSteamLeaderboard(client);
	if (leaderboard.length === 0) throw new Error(t('errors.steam.leaderboard.empty'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.leaderboards.steam.embed.title'))
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: t('interactions.leaderboards.steam.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
