import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { slug } from '../utils/slug.js';
import { fetchData } from '../utils/fetch.js';
import subscriptionsSchema from '../models/subscriptionsSchema.js';

const getDeals = async interaction => {
    const game = interaction.options.getString('game');

    const url = await searchDeals(game);
    if(!url) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const { name, image, historicalLows, officialStores, keyshops, coupons, subscriptions } = await getDealDetails(url);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(url)
            .setThumbnail(image || '')
            .addField('Historical Low Prices', historicalLows.length > 0 ? historicalLows.join('\n') : 'N/A')
            .addField('Official Stores', officialStores.length > 0 ? officialStores.join('\n') : 'N/A', true)
            .addField('Keyshops', keyshops.length > 0 ? keyshops.join('\n') : 'N/A', true)
            .addField('Coupons', coupons.length > 0 ? coupons.join('\n') : 'N/A')
            .addField('Subscriptions', subscriptions.length > 0 ? subscriptions.join('\n') : 'N/A')
            .setFooter('Powered by gg.deals.')
            .setColor('RANDOM')
    ]});
}

const searchDeals = async (game) => {
    const data = await fetchData(`https://gg.deals/eu/games/?view=list&title=${game}`);
    const $ = load(data);

    const href = $('#games-list .game-list-item a').first().attr('href');
    if(!href) return null;

    return `https://gg.deals${href}`;
}

const getDealDetails = async (url) => {
    const data = await fetchData(url);
    const $ = load(data);

    const name = $('.image-game').first().attr('alt');
    const image = $('.image-game').first().attr('src');

    const historicalLows = $('#game-lowest-tab-price .game-lowest-price-row').get().map(element => {
        const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
        const price = $(element).find('.game-lowest-price-inner-row .price span').first().text();
        const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
        const activeStatus = $(element).find('.game-lowest-price-details-row .active').first().text().trim();
        const expireStatus = $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();
        const status = activeStatus || expireStatus;

        return `> __${tag}__ \`${price}\` @ ${store} - ${status}`;
    });

    const couponsArray = [];
    const getCouponIndex = couponText => {
        const code = couponText.split(' ').pop();
        const isStored = couponsArray.some(item => item.code === code);
        if(!isStored) couponsArray.push({ code, message: `> *(${couponsArray.length + 1}) ${couponText}*` });

        return couponsArray.findIndex(item => item.code === code);
    };

    const officialStores = $('#official-stores .game-deals-container .game-deals-item').get().map(element => {
        const store = $(element).children('.shop-image').find('img').first().attr('alt');
        const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
        const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();

        const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
        const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
        const couponIndex = hasCoupon && getCouponIndex(couponText);

        return `> **[${store}](${url})** ${couponIndex ? `*(${couponIndex + 1})*` : ''} - \`${price}\``;
    });

    const keyshops = $('#keyshops .game-deals-container .game-deals-item').get().map(element => {
        const store = $(element).children('.shop-image').find('img').first().attr('alt');
        const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
        const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();

        const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
        const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
        const couponIndex = hasCoupon && getCouponIndex(couponText);

        return `> **[${store}](${url})** ${couponIndex ? `*(${couponIndex + 1})*` : ''} - \`${price}\``;
    });

    const coupons = couponsArray.map(item => item.message);

    const subscriptionsList = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`) } });
    const subscriptions = subscriptionsList.map(item => `> Included with **${item.subscription}**`);

    return { name, image, historicalLows, officialStores, keyshops, coupons, subscriptions };
}

export default { getDeals };
