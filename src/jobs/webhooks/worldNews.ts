import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as NewsAPI from '../../apis/newsApi';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';

export const data = {
    name: 'worldNews',
    schedule: '0 */30 * * * *'
}

export const execute = async (client: Bot) => {
    const latestArticles = await NewsAPI.getLatestArticles();
    if(latestArticles.length === 0) return;

    for(const article of latestArticles) {
        const { title, url } = article;

        const hasEntry = await client.manageState('World News', 'News', title, url);
        if(!hasEntry) continue;

        const articleIndex = latestArticles.findIndex(item => item.title === title && item.url === url);
        latestArticles.splice(articleIndex);
        break;
    }

    for(const article of latestArticles.reverse()) {
        const { source: { name }, author, title, description, content, publishedAt, url, urlToImage } = article;

        for(const [guildId, guild] of client.guilds.cache) {
            const webhook = await Webhooks.getWebhook(client, guildId, 'World News');
            if(!webhook) continue;

            await webhook.send({ embeds: [
                new MessageEmbed()
                    .setAuthor({ name: name ?? author ?? 'N/A' })
                    .setTitle(StringUtil.truncate(title))
                    .setURL(url)
                    .setThumbnail(urlToImage ?? '')
                    .setDescription(content ?? description ?? 'N/A')
                    .setTimestamp(new Date(publishedAt))
                    .setColor('RANDOM')
            ]});

            await SleepUtil.timeout(5000);
        }
    }
}