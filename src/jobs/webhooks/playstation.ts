import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';

export const data = {
    name: 'playstation',
    schedule: '0 */3 * * * *'
}

export const execute = async (client: Bot) => {
    const { 0: { data: { title, url, secure_media, is_self, crosspost_parent } } } = await Reddit.getPostsByFlair('PS5', 'new', ['Articles %26 Blogs', ':ps: Official']);
    
    const hasEntry = await client.manageState('Playstation', 'News', title, url);
    if(hasEntry || crosspost_parent || is_self) return;

    for(const [guildId, guild] of client.guilds.cache) {
        const webhook = await Webhooks.getWebhook(client, guildId, 'Playstation');
        if(!webhook) continue;
    
        if(secure_media) {
            await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${url}` });
            continue;
        }
    
        await webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(StringUtil.truncate(title))
                .setURL(url)
                .setColor('RANDOM')
        ]});
    }
}