import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { HowLongToBeatService } from 'howlongtobeat';
import { slug } from '../utils/slug.js';
import subscriptionsSchema from '../models/subscriptionsSchema.js';

const HowLongToBeat = new HowLongToBeatService();

const getGames = async interaction => {
    const game = interaction.options.getString('game');

    const id = await searchGame(game);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const { name, url, releaseDate, image, developer, publisher, platforms, stores, subscriptions, playtimes } = await getGameDetails(id);
    const hasPlaytimes = playtimes[0]?.gameplayMain > 0 || playtimes[0]?.gameplayMainExtra > 0 || playtimes[0]?.gameplayCompletionist > 0;

    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle(name)
                .setURL(url)
                .setThumbnail(image || '')
                .addField('**Release date**', releaseDate?.toString() || 'N/A')
                .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
                .addField('**Where to buy**', stores.length > 0 ? stores.join('\n') : 'N/A', true)
                .addField('**Subscriptions**', subscriptions.length > 0 ? subscriptions.join('\n') : 'N/A', true)
                .addField('**How long to beat**', `
                    ${!hasPlaytimes ? 'N/A' : ''}
                    ${playtimes[0]?.gameplayMain > 0 ? `> Main Story takes \`~${playtimes[0].gameplayMain}h\`` : ''}
                    ${playtimes[0]?.gameplayMainExtra > 0 ? `> Main Story + Extras takes \`~${playtimes[0].gameplayMainExtra}h\`` : ''}
                    ${playtimes[0]?.gameplayCompletionist > 0 ? `> Completionist takes \`~${playtimes[0].gameplayCompletionist}h\`` : ''}
                `)
                .addField('**Developer**', developer?.toString() || 'N/A', true)
                .addField('**Publisher**', publisher?.toString() || 'N/A', true)
                .setFooter('Powered by Rawg.io and HowLongToBeat.')
                .setColor('RANDOM')
        ]
    });
}

const searchGame = async game => {
    const res = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${game}`);
    const data = await res.json();

    if(data.results.length === 0) return null;

    const storesToAvoid = [8, 9];
    const filteredData = data.results.filter(item => item.stores && !storesToAvoid.includes(item.stores[0].store.id));

    return filteredData[0].id;
}

const getGameDetails = async id => {
    const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`);
    const data = await res.json();

    const name = data.name;
    const playtimes = await HowLongToBeat.search(data.name).catch(error => console.log(error));

    const platformsToAvoid = [5, 6, 171];
    const platforms = data.platforms.map(item => !platformsToAvoid.includes(item.platform.id) && `> ${item.platform.name}`).filter(Boolean);

    const storesList = data.stores.map(item => ({ id: item.store.id, name: item.store.name }));
    const stores = await getGameStores(id, storesList);

    const gamingSubscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`, 'g') } });
    const subscriptions = gamingSubscriptions.map(item => `> **${item.subscription}**`);

    return {
        name,
        url: data.website,
        releaseDate: data.released,
        image: data.background_image,
        developer: data.developers[0]?.name,
        publisher: data.publishers[0]?.name,
        platforms,
        stores,
        subscriptions,
        playtimes
    };
}

const getGameStores = async (id, storesList) => {
    const res = await fetch(`https://api.rawg.io/api/games/${id}/stores?key=${process.env.RAWG_API_KEY}`);
    const data = await res.json();

    return storesList.map(item => {
        const storeItem = data.results.find(nestedItem => nestedItem.store_id === item.id);
        return `> **[${item.name}](${storeItem.url})**`;
    }).filter(Boolean);
}

export default { getGames };