import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Series,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Series)
		.setDescription('Overview for a given series.')
		.addStringOption((option) => option.setName('series').setDescription('Series title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const series = interaction.options.getString('series', true);

	const { id } = await TheMovieDbApi.search(series, 'Series');
	if (!id) throw new Error(`No matches for ${series}.`);

	const { name, description, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres } =
		await TheMovieDbApi.getSeriesById(id);
	const { stream } = await TheMovieDbApi.getProviders(id, 'Series');

	const formattedStream = stream.map(({ name, entry }) => `> [${name}](${entry.url})`);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Status**',
				value: status,
			},
			{
				name: '**First Episode**',
				value: firstEpisode,
				inline: true,
			},
			{
				name: '**Next Episode**',
				value: nextEpisode ?? 'N/A',
				inline: true,
			},
			{
				name: '**Seasons**',
				value: seasons.toString(),
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
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
