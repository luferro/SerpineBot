import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const storedManga = new Map();

const getManga = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'Manga');
        if(!webhook) continue;

        const data = await fetchData('https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[publishAt]=desc&limit=20');
        if(data.data.length === 0) continue;

        const manga = { id: undefined, chapters: [] };
        for(const mangaChapter of data.data) {
            const { id, attributes: { chapter, title, externalUrl }, relationships } = mangaChapter;

            const url = externalUrl || `https://mangadex.org/chapter/${id}`;
            const isOneshot = !chapter && !title;
            const chapterNumber = chapter ? `Ch. ${chapter}` : '';
            const chapterTitle = title || '';

            const relationship = relationships.find(item => item.type === 'manga');
            if(manga.id && relationship.id !== manga.id) break;                 

            manga.id = relationship.id;
            manga.chapters.push({ manga: relationship.id, title: isOneshot ? 'Oneshot' : `${chapterNumber} ${chapterTitle}`, url });
        }

        const storedMangaChapters = storedManga.get('Manga') || [];
        storedManga.set('Manga', manga.chapters);

        const filteredChapters = manga.chapters
            .filter(item => !storedMangaChapters.some(nestedItem => nestedItem.manga === item.manga && nestedItem.url === item.url))
            .filter((item, index, self) => index === self.findIndex(nestedItem => nestedItem.url === item.url));
        if(filteredChapters.length === 0) continue;

        const state = manageState('Manga', { title: filteredChapters[0].title, url: filteredChapters[0].url });
        if(state.hasEntry) continue;

        const { title, url, image } = await getMangaDetails(manga.id);
        if(!title || !url) continue;

        const chapters = filteredChapters.slice(0, 10).map(item => `**[${item.title}](${item.url})**`);
        filteredChapters.length - chapters.length > 0 && chapters.push(`And ${filteredChapters.length - chapters.length} more!`);

        webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(formatTitle(title))
                .setURL(url)
                .setThumbnail(image || '')
                .addField('**Chapters**', chapters.length > 0 ? chapters.join('\n') : 'N/A')
                .setFooter('Powered by Mangadex.')
                .setColor('RANDOM')
        ]});
    }
}

const getMangaDetails = async id => {
    if(!id) return { title: null, url: null, image: null };
        
    const data = await fetchData(`https://api.mangadex.org/manga/${id}?includes[]=cover_art`);
    const { attributes: { title }, relationships } = data.data;

    const relationship = relationships.find(item => item.type === 'cover_art');
    const image = relationship ? `https://uploads.mangadex.org/covers/${id}/${relationship.attributes.fileName}` : null;

    return { title: title.en, url: `https://mangadex.org/title/${id}`, image };
}

export default { getManga };