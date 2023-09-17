import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.hltb.name'))
	.setDescription(t('interactions.gaming.hltb.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.gaming.hltb.options.0.name'))
			.setDescription(t('interactions.gaming.hltb.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.gaming.hltb.options.0.name'), true);

	const { id } = await client.api.gaming.playtimes.search({ query });
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const { name, image, playtimes } = await client.api.gaming.playtimes.getPlaytimesById({ id });
	const { main, mainExtra, completionist } = playtimes;

	const hasPlaytimes = main || mainExtra || completionist;
	if (!hasPlaytimes) throw new Error(t('errors.search.lookup', { query }));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.hltb.embed.title', { game: `\`${name}\`` }))
		.setURL(`https://howlongtobeat.com/game/${id}`)
		.setThumbnail(image)
		.addFields([
			{
				name: t('interactions.gaming.hltb.embed.fields.0.name'),
				value: main ? `~${main}` : t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.hltb.embed.fields.1.name'),
				value: mainExtra ? `~${mainExtra}` : t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.hltb.embed.fields.2.name'),
				value: completionist ? `~${completionist}` : t('common.unavailable'),
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
