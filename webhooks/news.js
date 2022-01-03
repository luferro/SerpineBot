import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';
import { getChannelType, getSubscribers, getVideoID } from '../utils/youtube.js';

const getURL = (link, isVideo, isTweet) => {
    if(isVideo) return `https://www.youtube.com/watch?v=${getVideoID(link)}`;
    if(isTweet) return link.split('?')[0];
    if(link.startsWith('/r/')) return `https://www.reddit.com${link}`;
    return link;
}

const getNews = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'News, Rumours and Discussions');
        if(!webhook) continue;

        const data = await fetchData(`https://www.reddit.com/r/Games/new.json`);
        if(data.data.children.length === 0) continue;
        
        const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);
        const { title, url: link, secure_media, is_self, crosspost_parent } = filteredData[0].data;

        const isVideo = secure_media?.type === 'youtube.com';
        const isTweet = secure_media?.type === 'twitter.com';
        const url = getURL(link, isVideo, isTweet);

        const state = manageState('News', { title, url });
        if(state.hasEntry || crosspost_parent || is_self) continue;

        const channelType = isVideo && getChannelType(secure_media.oembed.author_url);
        const channel = isVideo && secure_media.oembed.author_url?.split(`/${channelType}/`)[1];
        const subscribers = isVideo && await getSubscribers(channel, channelType, url);
        if(typeof subscribers === 'number' && subscribers < 50000) continue;

        if(secure_media) {
            webhook.send({ content: `**${formatTitle(title)}**\n${url}` });
            continue;
        }

        webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(formatTitle(title))
                .setURL(url)
                .setColor('RANDOM')
        ]});
    }
}

export default { getNews };