import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as OpenCritic from '../../apis/opencritic';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';

export const data = {
    name: 'reviews',
    schedule: '0 */30 * * * *'
}

export const execute = async (client: Bot) => {
    const { 0: { data: { selftext } } } = await Reddit.getPostsByFlair('Games', 'new', ['Review Thread']);
    const selftextArray = selftext?.split('\n')!;

    const opencriticMatch = selftextArray.find(item => item.includes('https://opencritic.com/game/'));
    const opencriticUrl = opencriticMatch?.match(/(?<=\()(.*)(?=\))/g)?.[0];
    const opencriticId = opencriticUrl?.match(/\d+/g)?.[0];

    const metacriticMatch = selftextArray.find(item => item.includes('https://www.metacritic.com/game/'));
    const metacriticSlug = metacriticMatch?.split('/')[5];

    const id = opencriticId ?? (metacriticSlug && await OpenCritic.search(metacriticSlug))
    if(!id) return;

    const { name, url, releaseDate, platforms, tier, score, count, recommended, image } = await OpenCritic.getReviewById(id);
    if(!tier && !score) return;

    const hasEntry = await client.manageState('Reviews', 'Opencritic', name, url);
    if(hasEntry) return;
    
    for(const [guildId, guild] of client.guilds.cache) {
        const webhook = await Webhooks.getWebhook(client, guildId, 'Reviews');
        if(!webhook) continue;
    
        await webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(StringUtil.truncate(name))
                .setURL(url)
                .setThumbnail(image ?? '')
                .addField('**Release date**', releaseDate)
                .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
                .addField('**Tier**', tier?.toString() ?? 'N/A')
                .addField('**Score**', score?.toString() ?? 'N/A', true)
                .addField('**Reviews count**', count?.toString() ?? 'N/A', true)
                .addField('**Critics Recommended**', recommended ? `${recommended}%` : 'N/A', true)
                .setColor('RANDOM')
        ]});
    }
}