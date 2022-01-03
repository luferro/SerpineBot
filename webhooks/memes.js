import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const subreddits = ['Memes', 'DankMemes', 'ProgrammerHumor'];

const getMemes = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'Memes');
        if(!webhook) continue;

        for(const subreddit of subreddits) {
            const data = await fetchData(`https://www.reddit.com/r/${subreddit}.json`);
            if(data.data.children.length === 0) continue;
            
            const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);
            const { title, url, permalink } = filteredData[0].data;
    
            const state = manageState(subreddit, { title, url });
            if(state.hasEntry) continue;
    
            const hasVideoExtension = ['gif', 'gifv', 'mp4'].some(item => url.includes(item));
            if(hasVideoExtension) {
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

export default { getMemes };