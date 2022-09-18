import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Movies,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Movies)
		.setDescription('Overview for a given movie.')
		.addStringOption((option) => option.setName('movie').setDescription('Movie title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const movie = interaction.options.getString('movie', true);

	const { id } = await TheMovieDbApi.search(movie, 'Movies');
	if (!id) throw new Error(`No matches for ${movie}.`);

	const { name, description, url, releaseDate, image, score, runtime, genres } = await TheMovieDbApi.getMovieById(id);
	const { stream, buy, rent } = await TheMovieDbApi.getProviders(id, 'Movies');

	const formattedStream = stream.map(({ name, entry }) => `> [${name}](${entry.url})`);
	const formattedBuy = buy.map(({ name, entry }) => `> [${name}](${entry.url})`);
	const formattedRent = rent.map(({ name, entry }) => `> [${name}](${entry.url})`);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Release date**',
				value: releaseDate,
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
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
