import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('movies')
	.setDescription('Movie overview.')
	.addStringOption((option) => option.setName('query').setDescription('Movie title.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id } = await client.api.shows.search('movie', query);
	if (!id) throw new Error(`No matches for "${query}".`);

	const { stream, buy, rent } = await client.api.shows.getProvidersForId('movie', id);
	const formattedStream = stream.map(({ provider, entry }) => `> [${provider}](${entry.url})`);
	const formattedBuy = buy.map(({ provider, entry }) => `> [${provider}](${entry.url})`);
	const formattedRent = rent.map(({ provider, entry }) => `> [${provider}](${entry.url})`);

	const { name, description, url, releaseDate, image, score, runtime, genres } = await client.api.shows.getMovieById(
		id,
	);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Release date**',
				value: releaseDate ?? 'N/A',
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
				name: '**Buy**',
				value: formattedBuy.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Rent**',
				value: formattedRent.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Stream**',
				value: formattedStream.join('\n') || 'N/A',
				inline: true,
			},
		])
		.setFooter({ text: 'Buy, Rent and Stream data provided by JustWatch.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
