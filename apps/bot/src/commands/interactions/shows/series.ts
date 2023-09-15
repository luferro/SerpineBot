import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.shows.series.name'))
	.setDescription(t('interactions.shows.series.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.shows.series.options.0.name'))
			.setDescription(t('interactions.shows.series.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.shows.series.options.0.name'), true);

	const { id } = await client.api.shows.search('tv', query);
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const { stream } = await client.api.shows.getProvidersForId('tv', id);
	const formattedStream = stream.map(({ provider, entry }) => `> [${provider}](${entry.url})`);

	const { name, description, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres } =
		await client.api.shows.getSeriesById(id);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: t('interactions.shows.series.embed.fields.0.name'),
				value: status ?? t('common.unavailable'),
			},
			{
				name: t('interactions.shows.series.embed.fields.1.name'),
				value: firstEpisode ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.2.name'),
				value: nextEpisode ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.3.name'),
				value: seasons?.toString() ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.4.name'),
				value: score ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.5.name'),
				value: runtime ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.6.name'),
				value: genres.join('\n') || t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.7.name'),
				value: formattedStream.join('\n') || t('common.unavailable'),
			},
		])
		.setFooter({ text: t('interactions.shows.series.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
