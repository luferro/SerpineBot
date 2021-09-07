const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');

module.exports = {
	name: 'deals',
    async getDeals(message, args) {
        message.delete({ timeout: 5000 });

        const game_query = args.slice(1).join(' ');
        if(!game_query) return message.channel.send('./cmd deals');
        try {
            const url = await this.searchDeals(game_query);
            if(!url) return message.channel.send(`Couldn't find a match for ${game_query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const { name, image, platform_url, historical_lows, official_stores, keyshops, coupons, subscriptions } = await this.getDealDetails(url);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: name,
                url: platform_url ? platform_url : url,
                fields: [
                    {
                        name: 'Historical Low Prices',
                        value: historical_lows.length > 0 ? historical_lows.join('\n'): 'N/A'
                    },
                    {
                        name: 'Official Stores',
                        value: official_stores.length > 0 ? official_stores.join('\n') : 'N/A',
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
        } catch (error) {
            console.log(error);
        }
    },
    async searchDeals(game) {
        try {
            const res = await fetch(`https://gg.deals/games/?view=list&title=${game}`, { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const href = $('#games-list .game-list-item a').first().attr('href');

            return href ? `https://gg.deals${href}` : null;
        } catch (error) {
            console.log(error);
        }
    },
    async getDealDetails(url) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const name = $('.image-game').first().attr('alt');

            const historical_lows = [];
            $('#game-lowest-tab-price .game-lowest-price-row').each((i, element) => {
                const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
                const price = $(element).find('.game-lowest-price-inner-row .price-widget').first().text();
                const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
                const isActive = $(element).children('.game-lowest-price-details-row div').last().hasClass('active');
                const status = isActive ?
                    $(element).find('.game-lowest-price-details-row .active').first().text().trim()
                    :
                    $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();                    

                historical_lows.push(`> __${tag}__ \`${price}\` @ ${store} - ${status}`);
            });

            const coupons = [];
            const getCoupons = (hasCoupon, couponText) => {
                const code = hasCoupon && couponText.split(' ').pop();

                const isStored = coupons.some(item => item.code === code);
                hasCoupon && !isStored && coupons.push({ code, message: `> *(${coupons.length + 1}) ${couponText}*`});
                const couponIndex = coupons.findIndex(item => item.code === code);

                return couponIndex;
            }

            const official_stores = [];
            $('#official-stores .game-deals-container .game-deals-item').each((i, element) => {
                const store = $(element).children('.shop-image').find('img').first().attr('alt');
                const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
                const price = $(element).children('.game-info-part-price').find('.price-wrapper .game-price-current').first().text();

                const hasCoupon = $(element).children('.game-info-part-price').find('.voucher-badge').length > 0;
                const couponText = hasCoupon && $(element).children('.game-info-part-price').find('.voucher-badge').first().text();
                const couponIndex = getCoupons(hasCoupon, couponText);                 
                
                official_stores.push(`> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*`: ''} - \`${price}\``);
            });

            const keyshops = [];
            $('#keyshops .game-deals-container .game-deals-item').each((i, element) => {
                const store = $(element).children('.shop-image').find('img').first().attr('alt');
                const url = `https://gg.deals${$(element).children('a').first().attr('href')}`;
                const price = $(element).children('.game-info-part-price').find('.price-wrapper .game-price-current').first().text();
                
                const hasCoupon = $(element).children('.game-info-part-price').find('.voucher-badge').length > 0;
                const couponText = hasCoupon && $(element).children('.game-info-part-price').find('.voucher-badge').first().text();
                const couponIndex = getCoupons(hasCoupon, couponText); 
                
                keyshops.push(`> **[${store}](${url})** ${couponIndex !== -1 ? `*(${couponIndex + 1})*`: ''} - \`${price}\``);
            });

            const subscriptions = [];
            const game_subscriptions = await subscriptionsSchema.find({ 'items.slug': { $regex: new RegExp(`^${slug(name)}`) } });
            game_subscriptions.forEach(element => subscriptions.push(`> Included with **${element.subscription}**`));
    
            return {
                name,
                image: $('.image-game').first().attr('src'),
                platform_url: $('.game-link-widget').first().attr('href'),
                historical_lows,
                official_stores,
                keyshops,
                coupons: coupons.map(item => item.message),
                subscriptions
            }   
        } catch (error) {
            console.log(error);
        }
    }
};
