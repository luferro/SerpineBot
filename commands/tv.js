import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { formatMinutesToHours } from '../utils/format.js';

const getTVSeries = async interaction => {
    const series = interaction.options.getString('series');

    const id = await searchTVSeries(series);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${series}.`, ephemeral: true });

    const { name, tagline, overview, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres, providers } = await getTVSeriesDetails(id);

    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle(name)
                .setURL(url)
                .setDescription(`
                    ${tagline ? `*${tagline}*` : ''}
                    \n${overview ? overview : ''}
                `)
                .setThumbnail(image || '')
                .addField('**Status**', status?.toString() || 'N/A')
                .addField('**First Episode**', firstEpisode?.toString() || 'N/A', true)
                .addField('**Next Episode**', nextEpisode?.toString() || 'N/A', true)
                .addField('**Seasons**', seasons?.toString() || 'N/A', true)
                .addField('**Score**', score?.toString() || 'N/A', true)
                .addField('**Runtime**', runtime?.toString() || 'N/A', true)
                .addField('**Genres**', genres.length > 0 ? genres.join('\n') : 'N/A', true)
                .addField('**Stream**', providers.flatrate?.length > 0 ? providers.flatrate.join('\n') : 'N/A', true)
                .setFooter('Powered by TheMovieDB and JustWatch.')
                .setColor('RANDOM')
        ]
    });
}

const searchTVSeries = async show => {
    const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${show}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    if(data.results.length === 0) return null;

    return data.results[0].id;
}

const getTVSeriesDetails = async id => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    const providers = await getTVSeriesProviders(id);
    const genres = data.genres.map(item => `> ${item.name}`);

    return {
        name: data.name,
        tagline: data.tagline,
        overview: data.overview,
        url: providers.url || data.homepage,
        status: data.status,
        firstEpisode: data.first_air_date,
        nextEpisode: data.next_episode_to_air instanceof Object ? data.next_episode_to_air.air_date : data.next_episode_to_air,
        seasons: data.seasons.length,
        image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`,
        score: `${data.vote_average}/10`,
        runtime: formatMinutesToHours(data.episode_run_time),
        genres,
        providers
    };
}

const getTVSeriesProviders = async id => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    const flatrate = data.results.PT?.flatrate?.map(item => `> ${item.provider_name}`);

    return {
        url: data.results.PT?.link,
        flatrate
    };
}

export default { getTVSeries };