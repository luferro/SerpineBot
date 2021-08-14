const fetch = require('node-fetch');

module.exports = {
	name: 'reviews',
    async getReviews(message, args) {
        message.delete({ timeout: 5000 });

        const game_query = args.slice(1).join(' ');
        if(!game_query) return message.channel.send('Usage: ./reviews <Game title>').then(m => { m.delete({ timeout: 5000 }) });
        try {
            const { id, name } = await this.searchGameReviews(game_query);
            
            const res = await fetch(`https://api.opencritic.com/api/game/${id}`);
            const data = await res.json();

            const url = `https://opencritic.com/game/${id}/${name}`;
            const title = data.name;
            const image = data.bannerScreenshot ? `https:${data.bannerScreenshot.fullRes}` : null;
            const releaseDate = data.firstReleaseDate.split('T')[0];
            const count = data.numReviews;
            const score = Math.round(data.topCriticScore);
            const tier = data.tier;
            const platforms = data.Platforms.map(platform => `> ${platform.name}`);
    
            if(!tier && score === -1) return message.channel.send(`Couldn't find reviews for ${game_query}.`);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title,
                url,
                fields: [
                    {
                      name: '**Release date**',
                      value: releaseDate
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
        const res = await fetch(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
        const data = await res.json();

        return { id: data[0].id, name: (data[0].name.toLowerCase().replace(/[\/.?=&:#]+/g, '')).replace(/\s+/g, '-') }
    }
};
