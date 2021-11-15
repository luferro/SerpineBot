import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { HowLongToBeatService } from 'howlongtobeat';
import subscriptionsSchema from '../models/subscriptionsSchema.js';
import { slug } from '../utils/slug.js';
import { erase } from '../utils/message.js';

const hltbService = new HowLongToBeatService();

const getGames = async(message, args) => {
    erase(message, 5000);

    const query = args.slice(1).join(' ');
    if(!query) return message.channel.send({ content: './cmd games' });

    const id = await searchGame(query);
    if(!id) return message.channel.send({ content: `Couldn't find a match for ${query}.` }).then(m => erase(m, 5000));

    const { name, url, releaseDate, image, developer, publisher, platformsList, storesList, subscriptionsList, playtimes } = await getGameDetails(id);

    const res = await fetch(`https://api.rawg.io/api/games/${id}/stores?key=${process.env.RAWG_API_KEY}`);
    const data = await res.json();

    const stores = [];
    storesList.forEach(item => {
        const storeItem = data.results.find(nestedItem => nestedItem.store_id === item.id);
        stores.push(`> **[${item.name}](${storeItem.url})**`);
    });

    const hasPlaytimes = playtimes[0]?.gameplayMain > 0 || playtimes[0]?.gameplayMainExtra > 0 || playtimes[0]?.gameplayCompletionist > 0;

    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle(name)
                .setURL(url)
                .setThumbnail(image || '')
                .addField('**Release date**', releaseDate?.toString() || 'N/A')
                .addField('**Available on**', platformsList.length > 0 ? platformsList.join('\n') : 'N/A')
                .addField('**Where to buy**', stores.length > 0 ? stores.join('\n') : 'N/A', true)
                .addField('**Subscriptions**', subscriptionsList.length > 0 ? subscriptionsList.join('\n') : 'N/A', true)
                .addField('**How long to beat**', `
                    ${!hasPlaytimes ? 'N/A' : ''}
                    ${playtimes[0]?.gameplayMain > 0 ? `> Main Story takes \`~${playtimes[0].gameplayMain}h\`` : ''}
                    ${playtimes[0]?.gameplayMainExtra > 0 ? `> Main Story + Extras takes \`~${playtimes[0].gameplayMainExtra}h\`` : ''}
                    ${playtimes[0]?.gameplayCompletionist > 0 ? `> Completionist takes \`~${playtimes[0].gameplayCompletionist}h\`` : ''}
                `)
                .addField('**Developer**', developer?.toString() || 'N/A', true)
                .addField('**Publisher**', publisher?.toString() || 'N/A', true)
                .setFooter('Powered by Rawg.io and HowLongToBeat.')
                .setColor(Math.floor(Math.random() * 16777214) + 1)
        ]
    });
}

const searchGame = async(game) => {
    const res = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${game}`);
    const data = await res.json();

    if(data.results.length === 0) return null;

    const storesToAvoid = [8, 9];
    const filteredData = data.results.filter(item => item.stores && !storesToAvoid.includes(item.stores[0].store.id));

    return filteredData[0].id;
}

const getGameDetails = async(id) => {
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

export default { getGames };