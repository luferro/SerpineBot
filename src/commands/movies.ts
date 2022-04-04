import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as TheMovieDB from '../apis/theMovieDB';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'movies',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('movies')
        .setDescription('Returns an overview for a movie.')
        .addStringOption(option => option.setName('movie').setDescription('Movie title.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const movie = interaction.options.getString('movie')!;

    const id = await TheMovieDB.search(movie, 'movie');
    if(!id) throw new InteractionError(`Couldn't find a match for ${movie}.`);

    const { name, tagline, overview, url, releaseDate, image, score, runtime, genres } = await TheMovieDB.getMovieById(id);
    const { stream, buy, rent } = await TheMovieDB.getProviders(id, 'movie');

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(url)
            .setDescription(`
                ${tagline ? `*${tagline}*` : ''}
                \n${overview ? overview : ''}
            `)
            .setThumbnail(image ?? '')
            .addField('**Release date**', releaseDate?.toString() ?? 'N/A')
            .addField('**Score**', score?.toString() ?? 'N/A', true)
            .addField('**Runtime**', runtime?.toString() ?? 'N/A', true)
            .addField('**Genres**', genres.length > 0 ? genres.join('\n') : 'N/A', true)
            .addField('**Buy**', buy.length > 0 ? buy.join('\n') : 'N/A', true)
            .addField('**Rent**', rent.length > 0 ? rent.join('\n') : 'N/A', true)
            .addField('**Stream**', stream.length > 0 ? stream.join('\n') : 'N/A', true)
            .setColor('RANDOM')
    ]});
}