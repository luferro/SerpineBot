import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
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
    const data = await fetchData(`https://api.themoviedb.org/3/search/movie?query=${movie}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
    return data.results[0]?.id;
}

const getMovieDetails = async id => {
    const data = await fetchData(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const { title, tagline, overview, homepage, release_date, poster_path, vote_average, runtime, genres: genresArray } = data;

    const genres = genresArray.map(item => `> ${item.name}`);
    const providers = await getMovieProviders(id);

    return {
        name: title,
        tagline,
        overview,
        url: providers.url || homepage,
        releaseDate: release_date,
        image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
        score: `${vote_average}/10`,
        runtime: formatMinutesToHours(runtime),
        genres,
        providers
    };
}

const getMovieProviders = async id => {
    const data = await fetchData(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
    const { PT } = data.results;

    const flatrate = PT?.flatrate?.map(item => `> ${item.provider_name}`);
    const rent = PT?.rent?.map(item => `> ${item.provider_name}`);
    const buy = PT?.buy?.map(item => `> ${item.provider_name}`);

    return {
        url: PT?.link,
        flatrate,
        rent,
        buy
    };
}

export default { getMovies };