const fetch = require('node-fetch');
const hltb = require('howlongtobeat');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');
const { erase } = require('../utils/message');

const hltbService = new hltb.HowLongToBeatService();

module.exports = {
	name: 'games',
    async getGames(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ');
        if(!query) return message.channel.send('./cmd games');

        const id = await this.searchGame(query);
        if(!id) return message.channel.send(`Couldn't find a match for ${query}.`).then(m => { m.delete({ timeout: 5000 }) });

        const { name, url, releaseDate, image, developer, publisher, platformsList, storesList, subscriptionsList, playtimes } = await this.getGameDetails(id);
                    
        const res = await fetch(`https://api.rawg.io/api/games/${id}/stores?key=${process.env.RAWG_API_KEY}`);
        const data = await res.json();

        const stores = [];
        storesList.forEach(item => {
            const storeItem = data.results.find(nestedItem => nestedItem.store_id === item.id);
            stores.push(`> **[${item.name}](${storeItem.url})**`);
        });

        const hasPlaytimes =  playtimes[0]?.gameplayMain > 0 || playtimes[0]?.gameplayMainExtra > 0 || playtimes[0]?.gameplayCompletionist > 0;

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
                        ${!hasPlaytimes ? 'N/A' : ''}
                        ${playtimes[0]?.gameplayMain > 0 ? `> Main Story takes \`~${playtimes[0].gameplayMain}h\`` : ''}
                        ${playtimes[0]?.gameplayMainExtra > 0 ? `> Main Story + Extras takes \`~${playtimes[0].gameplayMainExtra}h\`` : ''}
                        ${playtimes[0]?.gameplayCompletionist > 0 ? `> Completionist takes \`~${playtimes[0].gameplayCompletionist}h\`` : ''}
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
    },
    async searchGame(game) {
        const res = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${game}`);
        const data = await res.json();

        if(data.results.length === 0) return null;

        const storesToAvoid = [8, 9];
        const filteredData = data.results.filter(item => item.stores && !storesToAvoid.includes(item.stores[0].store.id));
        
        return filteredData[0].id;
    },
    async getGameDetails(id) {
        const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`);
        const data = await res.json();

        const name = data.name;
        const playtimes = await hltbService.search(data.name).catch(error => console.log(error));

        const platforms = [];
        const platformsToAvoid = [5, 6, 171];
        data.platforms.forEach(item => !platformsToAvoid.includes(item.platform.id) && platforms.push(`> ${item.platform.name}`));

        const stores = [];
        data.stores.forEach(item => stores.push({ id: item.store.id, name: item.store.name }));

        const subscriptions = [];
        const gamingSubscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`, 'g') } });
        gamingSubscriptions.forEach(element => subscriptions.push(`> **${element.subscription}**`));

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
        };
    }
};
