const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');
const { erase } = require('../utils/message');

module.exports = {
	name: 'deals',
    async getDeals(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ');
        if(!query) return message.channel.send('./cmd deals');

        const url = await this.searchDeals(query);
        if(!url) return message.channel.send(`Couldn't find a match for ${query}.`).then(m => { m.delete({ timeout: 5000 }) });

        const { name, image, platformURL, historicalLows, officialStores, keyshops, coupons, subscriptions } = await this.getDealDetails(url);

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: name,
            url: platformURL ? platformURL : url,
            fields: [
                {
                    name: 'Historical Low Prices',
                    value: historicalLows.length > 0 ? historicalLows.join('\n'): 'N/A'
                },
                {
                    name: 'Official Stores',
                    value: officialStores.length > 0 ? officialStores.join('\n') : 'N/A',
                    inline: true
                },
                {
                    name: 'Keyshops',
                    value: keyshops.length > 0 ? keyshops.join('\n') : 'N/A',
                    inline: true
                },
                {
                    name: 'Coupons',
                    value: coupons.length > 0 ? coupons.join('\n') : 'N/A'
                },
                {
                    name: 'Subscriptions',
                    value: subscriptions.length > 0 ? subscriptions.join('\n') : 'N/A'
                }
            ],
            thumbnail: {
                url: image ? image : ''
            },
            footer: {
                text: 'Powered by gg.deals'
            }
        }});
    },
    async searchDeals(game) {
        const res = await fetch(`https://gg.deals/games/?view=list&title=${game}`, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const href = $('#games-list .game-list-item a').first().attr('href');

        return href ? `https://gg.deals${href}` : null;
    },
    async getDealDetails(url) {
        const res = await fetch(url, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const name = $('.image-game').first().attr('alt');

        const historicalLows = [];
        $('#game-lowest-tab-price .game-lowest-price-row').each((i, element) => {
            const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
            const price = $(element).find('.game-lowest-price-inner-row .price span').first().text();
            const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
            const activeStatus = $(element).find('.game-lowest-price-details-row .active').first().text().trim()
            const expireStatus = $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();
            const status = activeStatus || expireStatus;

            historicalLows.push(`> __${tag}__ \`${price}\` @ ${store} - ${status}`);
        });

        const coupons = [];
        const getCoupons = (hasCoupon, couponText) => {
            const code = hasCoupon && couponText.split(' ').pop();

            const isStored = coupons.some(item => item.code === code);
            hasCoupon && !isStored && coupons.push({ code, message: `> *(${coupons.length + 1}) ${couponText}*`});
            const couponIndex = coupons.findIndex(item => item.code === code);

            return couponIndex;
        }

        const officialStores = [];
        $('#official-stores .game-deals-container .game-deals-item').each((i, element) => {
            const store = $(element).children('.shop-image').find('img').first().attr('alt');
            const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
            const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();

            const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
            const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
            const couponIndex = getCoupons(hasCoupon, couponText);                 
            
            officialStores.push(`> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*`: ''} - \`${price}\``);
        });

        const keyshops = [];
        $('#keyshops .game-deals-container .game-deals-item').each((i, element) => {
            const store = $(element).children('.shop-image').find('img').first().attr('alt');
            const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
            const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();
            
            const hasCoupon = $(element).children('.game-info-wrapper').find('.voucher-badge').length > 0;
            const couponText = hasCoupon && $(element).children('.game-info-wrapper').find('.voucher-badge').first().text();
            const couponIndex = getCoupons(hasCoupon, couponText); 
            
            keyshops.push(`> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*`: ''} - \`${price}\``);
        });

        const subscriptions = [];
        const gamingSubscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`) } });
        gamingSubscriptions.forEach(element => subscriptions.push(`> Included with **${element.subscription}**`));

        return {
            name,
            image: $('.image-game').first().attr('src'),
            platformURL: $('.game-link-widget').first().attr('href'),
            historicalLows,
            officialStores,
            keyshops,
            coupons: coupons.map(item => item.message),
            subscriptions
        };
    }
};
