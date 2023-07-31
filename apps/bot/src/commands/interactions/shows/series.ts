import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('series')
	.setDescription('Series overview.')
	.addStringOption((option) => option.setName('query').setDescription('Series title.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id } = await client.api.shows.tmdb.search('tv', query);
	if (!id) throw new Error(`No matches for "${query}".`);

	const { stream } = await client.api.shows.tmdb.getProvidersForId('tv', id);
	const formattedStream = stream.map(({ provider, entry }) => `> [${provider}](${entry.url})`);

	const { name, description, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres } =
		await client.api.shows.tmdb.getSeriesById(id);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Status**',
				value: status ?? 'N/A',
			},
			{
				name: '**First Episode**',
				value: firstEpisode ?? 'N/A',
				inline: true,
			},
			{
				name: '**Next Episode**',
				value: nextEpisode ?? 'N/A',
				inline: true,
			},
			{
				name: '**Seasons**',
				value: seasons?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Score**',
				value: score ?? 'N/A',
				inline: true,
			},
			{
				name: '**Runtime**',
				value: runtime ?? 'N/A',
				inline: true,
			},
			{
				name: '**Genres**',
				value: genres.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Stream**',
				value: formattedStream.join('\n') || 'N/A',
			},
		])
		.setFooter({ text: 'Stream data provided by JustWatch.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
