import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Deals from '../../apis/deals';
import * as Webhooks from '../../services/webhooks';
import { BlogCategories, DealCategories } from '../../types/categories';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';

export const data = {
    name: 'deals',
    schedule: '0 */5 * * * *'
}

export const execute = async (client: Bot) => {
    const categories: (BlogCategories | DealCategories)[] = ['bundles', 'free games', 'paid games', 'prime gaming', 'sales'];
    for(const category of categories) {
        if(category !== 'free games' && category !== 'paid games') {
            const { title, url, lead, image } = await Deals.getLatestBlogNews(category);
            if(!title || !url) continue;
    
            const hasEntry = await client.manageState('Deals', StringUtil.capitalize(category), title, url);
            if(hasEntry) continue;
    
            const message = new MessageEmbed()
                .setTitle(StringUtil.truncate(title))
                .setURL(url)
                .setThumbnail(image ?? '')
                .setDescription(lead ?? 'N/A')
                .setColor('RANDOM');

            await sendMessage(client, category, message);
            continue;
        }

        const latestDeals = await Deals.getLatestDeals(category);
        for(const deal of latestDeals.reverse()) {
            await SleepUtil.timeout(5000);
            const { title, url, image, store, discount, regular, discounted, coupon } = deal;

            const hasEntry = await client.manageState('Deals', StringUtil.capitalize(category), title, url);
            if(hasEntry) continue;

            const message = new MessageEmbed()
                .setTitle(title)
                .setURL(url)
                .setThumbnail(image ?? '')
                .setDescription(`${discount && regular ? `**${discount}** off! ~~${regular}~~ |` : ''} **${discounted}** @ **${store}**`)
                .setColor('RANDOM');

            if(category === 'paid games' && coupon) message.addField('Store coupon', `*${coupon}*`);

            await sendMessage(client, category, message);
        }
    }
}

const getWebhook = async (client: Bot, guildId: string, category: BlogCategories | DealCategories) => {
    const options = {
        'sales': () => Webhooks.getWebhook(client, guildId, 'Deals'),
        'bundles': () => Webhooks.getWebhook(client, guildId, 'Deals'),
        'prime gaming': () => Webhooks.getWebhook(client, guildId, 'Free Games'),
        'paid games': () => Webhooks.getWebhook(client, guildId, 'Deals'),
        'free games': () => Webhooks.getWebhook(client, guildId, 'Free Games')
    }
    return await options[category]();
}

const sendMessage = async (client: Bot, category: BlogCategories | DealCategories, message: MessageEmbed) => {
    for(const [guildId, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guildId, category);
        if(!webhook) continue;

        await webhook.send({ embeds: [message]});
    }
}