import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
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
    const data = await fetchData(`https://api.themoviedb.org/3/search/tv?query=${show}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
    return data.results[0]?.id;
}

const getTVSeriesDetails = async id => {
    const data = await fetchData(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const { name, tagline, overview, homepage, status, first_air_date, next_episode_to_air, seasons, poster_path, vote_average, episode_run_time, genres: genresArray } = data;

    const providers = await getTVSeriesProviders(id);
    const genres = genresArray.map(item => `> ${item.name}`)

    return {
        name,
        tagline,
        overview,
        status,
        url: providers.url || homepage,
        firstEpisode: first_air_date,
        nextEpisode: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air,
        seasons: seasons.length,
        image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
        score: `${vote_average}/10`,
        runtime: formatMinutesToHours(episode_run_time),
        genres,
        providers
    };
}

const getTVSeriesProviders = async id => {
    const data = await fetchData(`https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const { PT } = data.results;

    const flatrate = PT?.flatrate?.map(item => `> ${item.provider_name}`);

    return {
        url: PT?.link,
        flatrate
    };
}

export default { getTVSeries };