const fetch = require('node-fetch');
const { slug } = require('../utils/slug');

module.exports = {
	name: 'reviews',
    async getReviews(message, args) {
        message.delete({ timeout: 5000 });

        const game_query = args.slice(1).join(' ');
        if(!game_query) return message.channel.send('./cmd reviews');
        try {
            const { id, name } = await this.searchGameReviews(game_query);
            if(!id) return message.channel.send(`Couldn't find a match for ${game_query}.`).then(m => { m.delete({ timeout: 5000 }) }); 
            
            const { url, title, image, releaseDate, count, score, tier, platforms } = await this.getGameReviewsDetails(id, name);
            if(!tier && score === -1) return message.channel.send(`Couldn't find reviews for ${game_query}.`);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title,
                url,
                fields: [
                    {
                      name: '**Release date**',
                      value: releaseDate ? releaseDate : 'N/A'
                    },
                    {
                        name: '**Available on**',
                        value: platforms.length > 0 ? platforms.join('\n') : 'N/A'
                    },
                    {
                        name: '**Tier**',
                        value: tier ? tier : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Score**',
                        value: score && score > 0 ? score : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Reviews count**',
                        value: count ? count : 'N/A',
                        inline: true
                    }
                ],
                image: {
                    url: image ? image : ''
                },
                footer: {
                    text: 'Powered by OpenCritic'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async searchGameReviews(game) {
        try {
            const res = await fetch(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
            const data = await res.json();
            
            if(data.length === 0) return { id: null, name: null };

            return { id: data[0].id, name: slug(data[0].name) }
        } catch (error) {
            console.log(error);
        }
    },
    async getGameReviewsDetails(id, name) {
        try {
            const res = await fetch(`https://api.opencritic.com/api/game/${id}`);
            const data = await res.json();

            return {
                url: `https://opencritic.com/game/${id}/${name}`,
                title: data.name,
                image: data.bannerScreenshot ? `https:${data.bannerScreenshot.fullRes}` : null,
                releaseDate: data.firstReleaseDate.split('T')[0],
                count: data.numReviews,
                score: Math.round(data.topCriticScore),
                tier: data.tier,
                platforms: data.Platforms.map(platform => `> ${platform.name}`)
            }
        } catch (error) {
            console.log(error);
        }
    }
};
