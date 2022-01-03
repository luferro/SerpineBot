import { MessageEmbed } from 'discord.js';
import { slug } from '../utils/slug.js';
import { fetchData } from '../utils/fetch.js';
import subscriptionsSchema from '../models/subscriptionsSchema.js';

const getGames = async interaction => {
    const game = interaction.options.getString('game');

    const id = await searchGame(game);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const { name, url, releaseDate, image, subreddit, metacritic, platforms, stores, subscriptions, developers, publishers } = await getGameDetails(id);

    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle(name)
                .setURL(url)
                .setThumbnail(image || '')
                .addField('**Release date**', releaseDate?.toString() || 'N/A', true)
                .addField('**Metacritic**', metacritic?.toString() || 'N/A', true)
                .addField('**Subreddit**', subreddit ? `[${name}](${subreddit})` : 'N/A')
                .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A', true)
                .addField('**Where to buy**', stores.length > 0 ? stores.join('\n') : 'N/A', true)
                .addField('**Subscriptions**', subscriptions.length > 0 ? subscriptions.join('\n') : 'N/A')
                .addField('**Developers**', developers.length > 0 ? developers.join('\n') : 'N/A')
                .addField('**Publishers**', publishers.length > 0 ? publishers.join('\n') : 'N/A')
                .setFooter('Powered by Rawg.io.')
                .setColor('RANDOM')
        ]
    });
}

const searchGame = async game => {
    const data = await fetchData(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${game}&exclude_stores=8,9`);
    return data.results[0]?.id;
}

const getGameDetails = async id => {
    const data = await fetchData(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`);
    const { name, website, released, metacritic, background_image, reddit_url, platforms: platformsArray, stores: storesArray, developers: developersArray, publishers: publishersArray } = data;

    const platformsToAvoid = [5, 6, 171];
    const platforms = platformsArray.map(item => !platformsToAvoid.includes(item.platform.id) && `> ${item.platform.name}`).filter(Boolean);

    const storesList = storesArray.map(item => ({ id: item.store.id, name: item.store.name }));
    const stores = await getGameStores(id, storesList);

    const subscriptionsList = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`, 'g') } });
    const subscriptions = subscriptionsList.map(item => `> **${item.subscription}**`);

    const developers = developersArray.map(item => `> **${item.name}**`);
    const publishers = publishersArray.map(item => `> **${item.name}**`);

    return {
        name,
        url: website,
        releaseDate: released || 'TBA',
        image: background_image,
        subreddit: reddit_url,
        metacritic,
        platforms,
        stores,
        subscriptions,
        developers,
        publishers
    };
}

const getGameStores = async (id, stores) => {
    const data = await fetchData(`https://api.rawg.io/api/games/${id}/stores?key=${process.env.RAWG_API_KEY}`);

    return stores.map(item => {
        const storeItem = data.results.find(nestedItem => nestedItem.store_id === item.id);
        return `> **[${item.name}](${storeItem.url})**`;
    }).filter(Boolean);
}

export default { getGames };