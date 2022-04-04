import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Mangadex from '../../apis/mangadex';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';

export const data = {
    name: 'manga',
    schedule: '0 */10 * * * *'
}

export const execute = async (client: Bot) => {
    const latestChapters = await Mangadex.getLastestChapters();
    if(latestChapters.length === 0) return;

    const chaptersByManga = new Map(latestChapters.reverse().map(item => [item.mangaId, latestChapters.filter(nestedItem => nestedItem.mangaId === item.mangaId)]));
    for(const [mangaId, chapters] of chaptersByManga) {
        for(const chapter of chapters) {
            const { chapterId, title, url } = chapter;

            await SleepUtil.timeout(1000);
            const hasEntry = await client.manageState('Manga', 'Chapters', `${chapterId} - ${title}`, url);
            if(!hasEntry) continue;

            const chapterIndex = chapters.findIndex(item => item.chapterId === chapter.chapterId);
            chapters.splice(chapterIndex);
            break;
        }
        if(chapters.length === 0) continue;

        const { title, url, image } = await Mangadex.getMangaById(mangaId);
        if(!title && !url) continue;

        const formattedChapters = chapters.slice(0, 10).reverse().map(item => `**[${item.title}](${item.url})**`);
        chapters.length - formattedChapters.length > 0 && formattedChapters.push(`And ${chapters.length - formattedChapters.length} more!`);
        
        for(const [guildId, guild] of client.guilds.cache) {
            const webhook = await Webhooks.getWebhook(client, guildId, 'Manga');
            if(!webhook) continue;
        
            await webhook.send({ embeds: [
                new MessageEmbed()
                    .setTitle(StringUtil.truncate(title))
                    .setURL(url)
                    .setThumbnail(image ?? '')
                    .setDescription(formattedChapters.join('\n'))
                    .setColor('RANDOM')
            ]});
        }
    }
}