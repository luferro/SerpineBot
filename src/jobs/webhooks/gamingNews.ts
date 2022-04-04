import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Youtube from '../../apis/youtube';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';

export const data = {
    name: 'gamingNews',
    schedule: '0 */3 * * * *'
}

export const execute = async (client: Bot) => {
    const { 0: { data: { title, url, secure_media, is_self, crosspost_parent } } } = await Reddit.getPosts('Games', 'new');
    
    const isVideo = secure_media?.type === 'youtube.com';
    const isTweet = secure_media?.type === 'twitter.com';
    const newsUrl = getUrl(url, isVideo, isTweet);

    const hasEntry = await client.manageState('Gaming News', 'News', title, newsUrl);
    if(hasEntry || crosspost_parent || is_self) return;

    const subscribers = isVideo && await Youtube.getSubscribers(newsUrl);
    if(typeof subscribers === 'number' && subscribers < 50_000) return;

    for(const [guildId, guild] of client.guilds.cache) {
        const webhook = await Webhooks.getWebhook(client, guildId, 'Gaming News');
        if(!webhook) continue;
    
        if(secure_media) {
            await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${newsUrl}` });
            continue;
        }
    
        await webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(StringUtil.truncate(title))
                .setURL(newsUrl)
                .setColor('RANDOM')
        ]});
    }
}

const getUrl = (url: string, isVideo: boolean, isTweet: boolean) => {
    if(isTweet) return url.split('?')[0];
    if(isVideo) return `https://www.youtube.com/watch?v=${Youtube.getVideoId(url)}`;
    return url;
}