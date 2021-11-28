import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { formatMinutesToHours } from '../utils/format.js';

const getMovies = async interaction => {
    const movie = interaction.options.getString('movie');

    const id = await searchMovie(movie);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${movie}.`, ephemeral: true });

    const { name, tagline, overview, url, releaseDate, image, score, runtime, genres, providers } = await getMovieDetails(id);

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
                .addField('**Release date**', releaseDate?.toString() || 'N/A')
                .addField('**Score**', score?.toString() || 'N/A', true)
                .addField('**Runtime**', runtime?.toString() || 'N/A', true)
                .addField('**Genres**', genres.length > 0 ? genres.join('\n') : 'N/A', true)
                .addField('**Stream**', providers.flatrate?.length > 0 ? providers.flatrate.join('\n') : 'N/A', true)
                .addField('**Rent**', providers.rent?.length > 0 ? providers.rent.join('\n') : 'N/A', true)
                .addField('**Buy**', providers.buy?.length > 0 ? providers.buy.join('\n') : 'N/A', true)
                .setFooter('Powered by TheMovieDB and JustWatch.')
                .setColor('RANDOM')
        ]
    });
}
const searchMovie = async movie => {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${movie}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    if(data.results.length === 0) return null;

    return data.results[0].id;
}

const getMovieDetails = async id => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    const providers = await getMovieProviders(id);
    const genres = data.genres.map(item => `> ${item.name}`);

    return {
        name: data.title,
        tagline: data.tagline,
        overview: data.overview,
        url: providers.url || data.homepage,
        releaseDate: data.release_date,
        image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`,
        score: `${data.vote_average}/10`,
        runtime: formatMinutesToHours(data.runtime),
        genres,
        providers
    };
}

const getMovieProviders = async id => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const data = await res.json();

    const flatrate = data.results.PT?.flatrate?.map(item => `> ${item.provider_name}`);
    const rent = data.results.PT?.rent?.map(item => `> ${item.provider_name}`);
    const buy = data.results.PT?.buy?.map(item => `> ${item.provider_name}`);

    return {
        url: data.results.PT?.link,
        flatrate,
        rent,
        buy
    };
}

export default { getMovies };