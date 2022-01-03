import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';
import { formatTitle } from '../utils/format.js';

const getPlaystation = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'Playstation');
        if(!webhook) continue;

        const data = await fetchData('https://www.reddit.com/r/PS5/search.json?q=flair_name:"Articles %26 Blogs" OR flair_name:":ps: Official"&sort=new&restrict_sr=1');
        if(data.data.children.length === 0) continue;
        
        const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);
        const { title, url: link, secure_media } = filteredData[0].data;

        const isInvalid = ['https://www.reddit.com/r/PS5'].some(item => link.includes(item));
        if(isInvalid) continue;

        const url = link.includes('/r/') ? `https://www.reddit.com${link}` : link;

        const state = manageState('Playstation', { title, url });
        if(state.hasEntry) continue;

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

export default { getPlaystation };