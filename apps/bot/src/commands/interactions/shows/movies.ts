import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.shows.movies.name'))
	.setDescription(t('interactions.shows.movies.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.shows.movies.options.0.name'))
			.setDescription(t('interactions.shows.movies.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.shows.movies.options.0.name'), true);

	const { id } = await client.api.shows.search('movie', query);
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const { stream, buy, rent } = await client.api.shows.getProvidersForId('movie', id);
	const formattedStream = stream.map(({ provider, entry }) => `> [${provider}](${entry.url})`);
	const formattedBuy = buy.map(({ provider, entry }) => `> [${provider}](${entry.url})`);
	const formattedRent = rent.map(({ provider, entry }) => `> [${provider}](${entry.url})`);

	const { name, description, url, releaseDate, image, score, runtime, genres } =
		await client.api.shows.getMovieById(id);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: t('interactions.shows.movies.embed.fields.0.name'),
				value: releaseDate ?? t('common.unavailable'),
			},
			{
				name: t('interactions.shows.movies.embed.fields.1.name'),
				value: score ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.movies.embed.fields.2.name'),
				value: runtime ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.movies.embed.fields.3.name'),
				value: genres.join('\n') || t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.movies.embed.fields.4.name'),
				value: formattedBuy.join('\n') || t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.movies.embed.fields.5.name'),
				value: formattedRent.join('\n') || t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.movies.embed.fields.6.name'),
				value: formattedStream.join('\n') || t('common.unavailable'),
				inline: true,
			},
		])
		.setFooter({ text: t('interactions.shows.movies.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
