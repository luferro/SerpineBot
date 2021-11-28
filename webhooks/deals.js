import { MessageEmbed, WebhookClient } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import UserAgent from 'user-agents';
import { manageState } from '../handlers/webhooks.js';

const lastCategoryDeals = new Map();

const getDeals = async type => {
    const getCategory = type => {
        const options = {
            'sale': { url: 'https://gg.deals/eu/deals/?maxDiscount=99&minRating=7&sort=date', webhook: process.env.WEBHOOK_DEALS },
            'free games': { url: 'https://gg.deals/eu/deals/?minDiscount=100&sort=date', webhook: process.env.WEBHOOK_FREEGAMES }
        }
        return options[type];
    }
    const category = getCategory(type.toLowerCase());
    const webhook = new WebhookClient({ url: category.webhook });

    const deals = await searchDeals(type.toLowerCase(), category.url);
    if(!deals) return;

    const state = manageState(type.toLowerCase(), Array.isArray(deals) ? deals[0].url : deals.url);
    if(!state.hasCategory || state.hasEntry) return;

    if(!Array.isArray(deals)) {
        const message = new MessageEmbed()
            .setTitle(deals.title)
            .setURL(deals.url)
            .setThumbnail(deals.image || '')
            .setDescription(`${deals.discount && deals.regular ? `**${deals.discount}** off! ~~${deals.regular}~~ |` : ''} **${deals.discounted}** @ **${deals.store}**`)
            .setColor('RANDOM');
        deals.coupon.length > 0 && message.addField('Store coupon', `*${deals.coupon}*`);

        return webhook.send({ embeds: [message]});
    }

    const items = deals.slice(0, 10).map(item => `**[${item.title}](${item.url})**\n${item.discount && item.regular ? `**${item.discount}** off! ~~${item.regular}~~ |` : ''} **${item.discounted}**`);
    deals.length - items.length > 0 && items.push(`And ${deals.length - items.length} more!`);

    const message = new MessageEmbed()
        .setTitle(`${deals[0].store} ${type}!`)
        .setThumbnail(deals[0].storeImage || '')
        .setDescription(items.join('\n'))
        .setColor('RANDOM')
    deals[0].coupon.length > 0 && message.addField('Store coupon', `*${deals[0].coupon}*`);

    webhook.send({ embeds: [message]});
}

const searchDeals = async(category, url, page = 1, limit = 5) => {
    const res = await fetch(`${url}&page=${page}`, { headers: { 'User-Agent': new UserAgent().toString() } });
    if(!res.ok) return null;
    const html = await res.text();
    const $ = load(html);

    const array = [];
    while(page < limit) {
        let foundEverything = false;

        for(const element of $('#deals-list .list-items > div').get()) {
            const title = $(element).find(':nth-child(4) .game-info-title-wrapper a').text();
            const dealRating = $(element).find(':nth-child(4) .game-tags .tag-rating span.value svg').attr('title');
            const rating = parseFloat(dealRating.match(/\d+(\.\d+)?/g)[0]);
            const href = $(element).find(':last-child a:last-child').attr('href');
            const url = `https://gg.deals${href}`;
            const image = $(element).find(':nth-child(3) img').attr('src').replace('154x72', '308x144');
            const store = $(element).find(':last-child .shop-icon img').attr('alt');
            const storeImage = $(element).find(':last-child .shop-icon img').attr('src').replace('60xt52', '120xt52');
            const coupon = $(element).find(':nth-child(4) ul li.badge-sticky span.voucher-badge').text();
            const discount = $(element).find(':nth-child(4) ul li.badge-discount span').text();
            const regular = $(element).find(':nth-child(4) div.price-wrapper span.price-old').text();
            const discounted = $(element).find(':nth-child(4) div.price-wrapper span.game-price-new').text();

            if(array.length > 0 && store !== array[0].store) {
                foundEverything = true;
                break;
            }
    
            array.push({ title, rating, url, image, store, storeImage, coupon, discount, regular, discounted });
        }
        if(foundEverything) break;
        page++;
    }
    const lastDeals = lastCategoryDeals.get(category) || [];
    const deals = array
        .filter(item => !lastDeals.some(nestedItem => nestedItem.store === item.store && nestedItem.url === item.url))
        .filter((item, index, self) => index === self.findIndex(nestedItem => nestedItem.url === item.url));

    if(deals.length === 0) return null;
    lastCategoryDeals.set(category, array);

    if(deals.length === 1) return deals[0];
    return deals.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
}

export default { getDeals };