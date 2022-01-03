import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const storedDeals = new Map();

const categories = [
    { name: 'Sale', url: 'https://gg.deals/news/deals/', execute: (...args) => getBlogNews(...args) },
    { name: 'Bundles', url: 'https://gg.deals/news/bundles', execute: (...args) => getBlogNews(...args) },
    { name: 'Prime Gaming', url: 'https://gg.deals/news/prime-gaming-free-games', execute: (...args) => getBlogNews(...args) },
    { name: 'Paid Games', url: 'https://gg.deals/eu/deals/?maxDiscount=99&minRating=8&sort=date', execute: (...args) => getDiscountedDeals(...args) },
    { name: 'Free Games', url: 'https://gg.deals/eu/deals/?minDiscount=100&minRating=0&sort=date', execute: (...args) => getDiscountedDeals(...args) }
];

const getDeals = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        for(const category of categories) {
            await category.execute(client, guild, category.name, category.url);
        }
    }
}

const getDiscountedDeals = async (client, guild, category, link) => {
    const getCategoryWebhook = type => {
        const options = {
            'Paid Games': () => getWebhook(client, guild, 'Game Deals'),
            'Free Games': () => getWebhook(client, guild, 'Free Games')
        }
        return options[type]();
    }
    const webhook = await getCategoryWebhook(category);
    if(!webhook) return;

    const data = await fetchData(link);
    const $ = load(data);

    const games = { store: undefined, deals: [] }
    for(const element of $('#deals-list .list-items > div').get()) {
        const title = $(element).find(':nth-child(4) .game-info-title-wrapper a').text();
        const dealRating = $(element).find(':nth-child(4) .game-tags .tag-rating span.value svg').attr('title');
        const href = $(element).find(':last-child a:last-child').attr('href');
        const image = $(element).find(':nth-child(3) img').attr('src').replace('154x72', '308x144');
        const store = $(element).find(':last-child .shop-icon img').attr('alt');
        const storeImage = $(element).find(':last-child .shop-icon img').attr('src').replace('60xt52', '120xt52');
        const coupon = $(element).find(':nth-child(4) ul li.badge-sticky span.voucher-badge').text();
        const discount = $(element).find(':nth-child(4) ul li.badge-discount span').text();
        const regular = $(element).find(':nth-child(4) div.price-wrapper span.price-old').text();
        const discounted = $(element).find(':nth-child(4) div.price-wrapper span.game-price-new').text();
        const timestamp = $(element).find(':nth-child(4) .game-tags .time-tag span.value time').attr('datetime');

        const url = `https://gg.deals${href}`;
        const rating = parseFloat(dealRating?.match(/\d+(\.\d+)?/g)[0]) || 0;

        if(games.store && games.store !== store) break;

        games.store = store;
        games.deals.push({ title, rating, url, image, store, storeImage, coupon, discount, regular, discounted, timestamp });
    }

    const storedCategoryDeals = storedDeals.get(category) || [];
    storedDeals.set(category, games.deals);

    const filteredDeals = games.deals
        .filter(item => !storedCategoryDeals.some(nestedItem => nestedItem.store === item.store && nestedItem.url === item.url))
        .filter((item, index, self) => index === self.findIndex(nestedItem => nestedItem.url === item.url))
        .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
    if(filteredDeals.length === 0) return;

    const state = manageState(category, { title: filteredDeals[0].title, url: filteredDeals[0].url });
    if(state.hasEntry) return;

    const todayDeals = filteredDeals.filter(item => new Date().setHours(0, 0, 0, 0) === new Date(item.timestamp).setHours(0, 0, 0, 0));
    if(todayDeals.length === 0) return;
    const { 0: { title, url, image, discount, regular, discounted, store, storeImage, coupon } } = todayDeals;

    if(todayDeals.length === 1) {
        const message = new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setThumbnail(image || '')
            .setDescription(`${discount && regular ? `**${discount}** off! ~~${regular}~~ |` : ''} **${discounted}** @ **${store}**`)
            .setFooter('Powered by gg.deals.')
            .setColor('RANDOM');
        coupon.length > 0 && message.addField('Store coupon', `*${coupon}*`);

        return webhook.send({ embeds: [message]});
    }

    const deals = todayDeals.slice(0, 10).map(item => `**[${item.title}](${item.url})**\n${item.discount && item.regular ? `**${item.discount}** off! ~~${item.regular}~~ |` : ''} **${item.discounted}**`);
    todayDeals.length - deals.length > 0 && deals.push(`And ${todayDeals.length - deals.length} more!`);

    const message = new MessageEmbed()
        .setTitle(store)
        .setThumbnail(storeImage || '')
        .setDescription(deals.join('\n'))
        .setFooter('Powered by gg.deals.')
        .setColor('RANDOM')
    coupon.length > 0 && message.addField('Store coupon', `*${coupon}*`);

    webhook.send({ embeds: [message]});
}

const getBlogNews = async (client, guild, category, link) => {
    const getCategoryWebhook = type => {
        const options = {
            'Sale': () => getWebhook(client, guild, 'Game Deals'),
            'Bundles': () => getWebhook(client, guild, 'Game Deals'),
            'Prime Gaming': () => getWebhook(client, guild, 'Free Games')
        }
        return options[type]();
    }
    const webhook = await getCategoryWebhook(category);
    if(!webhook) return;

    const data = await fetchData(link);
    const $ = load(data);

    const title = $('.news-section .news-list .news-info-wrapper .news-title a').first().text();
    const href = $('.news-section .news-list .news-info-wrapper .news-title a').first().attr('href');
    const lead = $('.news-section .news-list .news-info-wrapper .news-lead').first().text().trim();
    const image = $('.news-section .news-list .news-image-wrapper img').first().attr('src').replace('334cr175', '668cr350');

    const url = `https://gg.deals${href}`;

    const state = manageState(category, { title, url });
    if(state.hasEntry) return;

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(formatTitle(title))
            .setURL(url)
            .setThumbnail(image || '')
            .setDescription(lead || 'N/A')
            .setFooter('Powered by gg.deals.')
            .setColor('RANDOM')
    ]});
}

export default { getDeals };