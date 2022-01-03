import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';
import { formatTitle } from '../utils/format.js';

const subreddits = ['Boobs', 'Gonewild', 'RealGirls', 'BiggerThanYouThought', 'TittyDrop', 'BreedingMaterial'];

const getURL = (link, media, gallery) => {
    if(media) return  media.oembed.thumbnail_url.replace(media.oembed.thumbnail_url.split('-')[1], 'mobile.mp4');
    if(gallery) return `https://i.redd.it/${gallery.items[0].media_id}.jpg`;
    return link;
}

const getNSFW = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'NSFW');
        if(!webhook) continue;

        const webhookChannel = await client.channels.fetch(webhook.channelId);
        if(!webhookChannel.nsfw) continue;

        for(const subreddit of subreddits) {
            const data = await fetchData(`https://www.reddit.com/r/${subreddit}.json`);
            if(data.data.children.length === 0) continue;
            
            const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);
            const { title, url: link, permalink, secure_media, gallery_data } = filteredData[0].data;

            const url = getURL(link, secure_media, gallery_data);

            const state = manageState(subreddit, { title, url });
            if(state.hasEntry) continue;

            const hasVideoExtension = ['gif', 'gifv', 'mp4'].some(item => url.includes(item));
            if(secure_media || hasVideoExtension) {
                webhook.send({ content: `**[${formatTitle(title)}](<https://www.reddit.com${permalink}>)**\n${url}` });
                continue;
            }

            webhook.send({ embeds: [
                new MessageEmbed()
                    .setTitle(formatTitle(title))
                    .setURL(`https://www.reddit.com${permalink}`)
                    .setImage(url)
                    .setColor('RANDOM')
            ]});
        }
    }
}

export default { getNSFW };