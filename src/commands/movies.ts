import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as TheMovieDB from '../apis/theMovieDB';

export const data = {
	name: 'movies',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('movies')
		.setDescription('Returns an overview for a movie.')
		.addStringOption((option) => option.setName('movie').setDescription('Movie title.').setRequired(true)),
};

export const execute = async (interaction: CommandInteraction) => {
	const movie = interaction.options.getString('movie')!;

	const id = await TheMovieDB.search(movie, 'movie');
	if (!id) return await interaction.reply({ content: `Couldn't find a match for ${movie}.`, ephemeral: true });

	const { name, description, url, releaseDate, image, score, runtime, genres } = await TheMovieDB.getMovieById(id);
	const { stream, buy, rent } = await TheMovieDB.getProviders(id, 'movie');

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(name)
				.setURL(url)
				.setDescription(description)
				.setThumbnail(image ?? '')
				.addField('**Release date**', releaseDate?.toString() ?? 'N/A')
				.addField('**Score**', score?.toString() ?? 'N/A', true)
				.addField('**Runtime**', runtime?.toString() ?? 'N/A', true)
				.addField('**Genres**', genres.join('\n') || 'N/A', true)
				.addField('**Buy**', buy.join('\n') || 'N/A', true)
				.addField('**Rent**', rent.join('\n') || 'N/A', true)
				.addField('**Stream**', stream.join('\n') || 'N/A', true)
				.setColor('RANDOM'),
		],
	});
};
