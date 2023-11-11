import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.steam.charts.name'))
	.setDescription(t('interactions.gaming.steam.charts.description'))
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.gaming.steam.charts.options.0.name'))
			.setDescription(t('interactions.gaming.steam.charts.options.0.description'))
			.addChoices(
				{ name: t('interactions.gaming.steam.charts.options.0.choices.0.name'), value: 0 },
				{ name: t('interactions.gaming.steam.charts.options.0.choices.1.name'), value: 1 },
				{ name: t('interactions.gaming.steam.charts.options.0.choices.2.name'), value: 2 },
			)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const chart = interaction.options.getInteger(t('interactions.gaming.steam.charts.options.0.name'), true);

	const data = await client.api.gaming.platforms.steam.getChart({ chart });
	if (data.length === 0) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(
			t('interactions.gaming.steam.charts.embed.title', {
				chart: t(`interactions.gaming.steam.charts.options.0.choices.${chart}.name`),
			}),
		)
		.setDescription(data.map(({ position, name, url }) => `\`${position}.\` [${name}](${url})`).join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
