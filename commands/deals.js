import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import UserAgent from 'user-agents';
import { slug } from '../utils/slug.js';
import subscriptionsSchema from '../models/subscriptionsSchema.js';

const getDeals = async interaction => {
    const game = interaction.options.getString('game');

    const url = await searchDeals(game);
    if(!url) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const { name, image, historicalLows, officialStores, keyshops, coupons, subscriptions } = await getDealDetails(url);

    interaction.reply({
        embeds: [
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
        ]
    });
}

const searchDeals = async(game) => {
    const res = await fetch(`https://gg.deals/eu/games/?view=list&title=${game}`, { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const href = $('#games-list .game-list-item a').first().attr('href');

    return href ? `https://gg.deals${href}` : null;
}

const getDealDetails = async(url) => {
    const res = await fetch(url, { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const name = $('.image-game').first().attr('alt');

    const historicalLows = $('#game-lowest-tab-price .game-lowest-price-row').get().map(element => {
        const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
        const price = $(element).find('.game-lowest-price-inner-row .price span').first().text();
        const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
        const activeStatus = $(element).find('.game-lowest-price-details-row .active').first().text().trim();
        const expireStatus = $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();
        const status = activeStatus || expireStatus;

        return `> __${tag}__ \`${price}\` @ ${store} - ${status}`;
    });

    const coupons = [];
    const getCoupons = (hasCoupon, couponText) => {
        const code = hasCoupon && couponText.split(' ').pop();
        const isStored = coupons.some(item => item.code === code);
        hasCoupon && !isStored && coupons.push({ code, message: `> *(${coupons.length + 1}) ${couponText}*` });
        return coupons.findIndex(item => item.code === code);
    };

    const officialStores = $('#official-stores .game-deals-container .game-deals-item').get().map(element => {
        const store = $(element).children('.shop-image').find('img').first().attr('alt');
        const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
        const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();

        const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
        const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
        const couponIndex = getCoupons(hasCoupon, couponText);

        return `> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*` : ''} - \`${price}\``;
    });

    const keyshops = $('#keyshops .game-deals-container .game-deals-item').get().map(element => {
        const store = $(element).children('.shop-image').find('img').first().attr('alt');
        const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
        const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();

        const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
        const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
        const couponIndex = getCoupons(hasCoupon, couponText);

        return `> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*` : ''} - \`${price}\``;
    });

    const gamingSubscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`) } });
    const subscriptions = gamingSubscriptions.map(item => `> Included with **${item.subscription}**`);

    return {
        name,
        image: $('.image-game').first().attr('src'),
        historicalLows,
        officialStores,
        keyshops,
        coupons: coupons.map(item => item.message),
        subscriptions
    };
}

export default { getDeals };
