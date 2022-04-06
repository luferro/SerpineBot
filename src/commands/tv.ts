import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as TheMovieDB from '../apis/theMovieDB';

export const data = {
    name: 'tv',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('tv')
        .setDescription('Returns an overview of a given TV series.')
        .addStringOption(option => option.setName('show').setDescription('TV show title.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const show = interaction.options.getString('show')!;

    const id = await TheMovieDB.search(show, 'tv');
    if(!id) return await interaction.reply({ content: `Couldn't find a match for ${show}.`, ephemeral: true });

    const { name, tagline, overview, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres } = await TheMovieDB.getTvShowById(id);
    const { stream } = await TheMovieDB.getProviders(id, 'tv');

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(url)
            .setDescription(`
                ${tagline ? `*${tagline}*` : ''}
                \n${overview ? overview : ''}
            `)
            .setThumbnail(image ?? '')
            .addField('**Status**', status?.toString() ?? 'N/A')
            .addField('**First Episode**', firstEpisode?.toString() ?? 'N/A', true)
            .addField('**Next Episode**', nextEpisode?.toString() ?? 'N/A', true)
            .addField('**Seasons**', seasons?.toString() ?? 'N/A', true)
            .addField('**Score**', score?.toString() ?? 'N/A', true)
            .addField('**Runtime**', runtime?.toString() ?? 'N/A', true)
            .addField('**Genres**', genres.length > 0 ? genres.join('\n') : 'N/A', true)
            .addField('**Stream**', stream.length > 0 ? stream.join('\n') : 'N/A')
            .setColor('RANDOM')
    ]});
}