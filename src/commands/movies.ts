import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as TheMovieDB from '../apis/theMovieDB';
import { CommandName, SubscriptionCategory } from '../types/enums';

export const data = {
	name: CommandName.Movies,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Movies)
		.setDescription('Overview for a given movie.')
		.addStringOption((option) => option.setName('movie').setDescription('Movie title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const movie = interaction.options.getString('movie', true);

	const id = await TheMovieDB.search(movie, SubscriptionCategory.Movies);
	if (!id) throw new Error(`No matches for ${movie}.`);

	const { name, description, url, releaseDate, image, score, runtime, genres } = await TheMovieDB.getMovieById(id);
	const { stream, buy, rent } = await TheMovieDB.getProviders(id, SubscriptionCategory.Movies);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Release date**',
				value: releaseDate?.toString() ?? 'N/A',
			},
			{
				name: '**Score**',
				value: score?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Runtime**',
				value: runtime?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Genres**',
				value: genres.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Buy**',
				value: buy.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Rent**',
				value: rent.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Stream**',
				value: stream.join('\n') || 'N/A',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
