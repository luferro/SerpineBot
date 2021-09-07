const fetch = require('node-fetch');
const hltb = require('howlongtobeat');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');

const hltbService = new hltb.HowLongToBeatService();

module.exports = {
	name: 'games',
    async getGames(message, args) {
        message.delete({ timeout: 5000 });

        const game_query = args.slice(1).join(' ');
        if(!game_query) return message.channel.send('./cmd games');
        try {
            const id = await this.searchGame(game_query);
            if(!id) return message.channel.send(`Couldn't find a match for ${game_query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const { name, url, releaseDate, image, developer, publisher, platformsList, storesList, subscriptionsList, playtimes } = await this.getGameDetails(id);
                        
            const res = await fetch(`https://api.rawg.io/api/games/${id}/stores?key=${process.env.RAWG_API_KEY}`);
            const data = await res.json();

            const stores = [];
            storesList.forEach(item => {
                const storeItem = data.results.find(nestedItem => nestedItem.store_id === item.id);
                stores.push(`> **[${item.name}](${storeItem.url})**`);
            });

            const hasPlaytimes =  playtimes[0]?.gameplayMain > 0 && playtimes[0]?.gameplayMainExtra > 0 && playtimes[0]?.gameplayCompletionist > 0;

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: name,
                url,
                fields: [
                    {
                        name: '**Release date**',
                        value: releaseDate ? releaseDate : 'N/A'
                    },
                    {
                        name: '**Available on**',
                        value: platformsList.length > 0 ? platformsList.join('\n') : 'N/A'
                    },
                    {
                        name: '**Where to buy**',
                        value: stores.length > 0 ? stores.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Subscriptions**',
                        value: subscriptionsList.length > 0 ? subscriptionsList.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**How long to beat**',
                        value: `
                            ${playtimes.length === 0 || !hasPlaytimes ? 'N/A' : ''}
                            ${playtimes[0]?.gameplayMain > 0 ? `> __Main Story__ takes ~${playtimes[0].gameplayMain}h` : ''}
                            ${playtimes[0]?.gameplayMainExtra > 0 ? `> __Main Story + Extras__ takes ~${playtimes[0].gameplayMainExtra}h` : ''}
                            ${playtimes[0]?.gameplayCompletionist > 0 ? `> __Completionist__ takes ~${playtimes[0].gameplayCompletionist}h` : ''}
                        `
                    },
                    {
                        name: '**Developer**',
                        value: developer ? developer : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Publisher**',
                        value: publisher ? publisher : 'N/A',
                        inline: true
                    }
                ],
                thumbnail: {
                    url: image ? image : ''
                },
                footer: {
                    text: 'Powered by Rawg.io and HowLongToBeat'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async searchGame(game) {
        try {
            const res = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${game}`);
            const data = await res.json();
    
            if(data.results.length === 0) return null;
    
            return data.results[0].id;   
        } catch (error) {
            console.log(error);
        }
    },
    async getGameDetails(id) {
        try {
            const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`);
            const data = await res.json();

            const name = data.name;

            const playtimes = await hltbService.search(data.name).catch(error => console.log(error));
    
            const platforms = [];
            data.platforms.forEach(item => platforms.push(`> ${item.platform.name}`));
    
            const stores = [];
            data.stores.forEach(item => stores.push({ id: item.store.id, name: item.store.name }));

            const subscriptions = [];
            const game_subscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`, 'g') } });
            game_subscriptions.forEach(element => subscriptions.push(`> **${element.subscription}**`));
    
            return {
                name,
                url: data.website,
                releaseDate: data.released,
                image: data.background_image,
                developer: data.developers[0]?.name,
                publisher: data.publishers[0]?.name,
                platformsList: platforms,
                storesList: stores,
                subscriptionsList: subscriptions,
                playtimes
            }   
        } catch (error) {
            console.log(error);
        }
    }
};
