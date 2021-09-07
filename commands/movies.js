const fetch = require('node-fetch');

module.exports = {
	name: 'movies',
    minutesToHours(time) {
        const hours = Math.floor(time / 60).toString();          
        const minutes = (time % 60).toString().padStart(2,'0');

        return `${hours}h${minutes}m`;
    },
    async getMovies(message, args) {
        message.delete({ timeout: 5000 });

        const movie_query = args.slice(1).join(' ');
        if(!movie_query) return message.channel.send('./cmd movies');
        try {
            const id = await this.searchMovie(movie_query);
            if(!id) return message.channel.send(`Couldn't find a match for ${movie_query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const { name, tagline, overview, url, releaseDate, image, score, runtime, genres, providers } = await this.getMovieDetails(id);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: name,
                url,
                description: `
                    ${tagline ? `*${tagline}*` : ''}
                    \n${overview ? overview : ''}
                `,
                fields: [
                    {
                        name: '**Release date**',
                        value: releaseDate ? releaseDate : 'N/A'
                    },
                    {
                        name: '**Score**',
                        value: score ? score : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Runtime**',
                        value: runtime ? runtime : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Genres**',
                        value: genres.length > 0 ? genres.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Stream**',
                        value: providers.flatrate.length > 0 ? providers.flatrate.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Rent**',
                        value: providers.rent.length > 0 ? providers.rent.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Buy**',
                        value: providers.buy.length > 0 ? providers.buy.join('\n') : 'N/A',
                        inline: true
                    }
                ],
                thumbnail: {
                    url: image ? image : ''
                },
                footer: {
                    text: 'Powered by The Movie DB and JustWatch.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async searchMovie(movie) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${movie}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();
    
            if(data.results.length === 0) return null;
  
            return data.results[0].id;   
        } catch (error) {
            console.log(error);
        }
    },
    async getMovieDetails(id) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();
    
            const providers = await this.getMovieProviders(id);

            const genres = [];
            data.genres.forEach(item => genres.push(`> ${item.name}`));
    
            return {
                name: data.title,
                tagline: data.tagline,
                overview: data.overview,
                url: providers.url ? providers.url : data.homepage,
                releaseDate: data.release_date,
                image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`,
                score: `${data.vote_average}/10`,
                runtime: this.minutesToHours(data.runtime),
                genres,
                providers
            }   
        } catch (error) {
            console.log(error);
        }
    },
    async getMovieProviders(id) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();

            const flatrate = [];
            data.results.PT?.flatrate.forEach(item => flatrate.push(`> ${item.provider_name}`));

            const rent = [];
            data.results.PT?.rent.forEach(item => rent.push(`> ${item.provider_name}`));
    
            const buy = [];
            data.results.PT?.buy.forEach(item => buy.push(`> ${item.provider_name}`));

            return {
                url: data.results.PT?.link,
                flatrate,
                rent,
                buy
            }   
        } catch (error) {
            console.log(error);
        }
    }
};
