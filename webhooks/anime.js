import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const aggregators = [
    { name: 'Kitsu', url: 'kitsu.io' },
    { name: 'AniList', url: 'anilist.co' },
    { name: 'MyAnimeList', url: 'myanimelist.net' },
    { name: 'Anime-Planet', url: 'www.anime-planet.com' }
];

const streams = [
    { name: 'VRV', url: 'vrv.co' },
    { name: 'HIDIVE', url: 'www.hidive.com' },
    { name: 'Netflix', url: 'www.netflix.com' },
    { name: 'AnimeLab', url: 'www.animelab.com' },
    { name: 'Crunchyroll', url: 'crunchyroll.com' },
    { name: 'Funimation', url: 'www.funimation.com' }
];

const getAnime = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'Anime');
        if(!webhook) continue;

        const data = await fetchData('https://www.reddit.com/r/Anime/search.json?q=flair_name:"Episode"&sort=new&restrict_sr=1');
        if(data.data.children.length === 0) continue;
        
        const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);
        const { title, url, selftext } = filteredData[0].data;

        const state = manageState('Anime', { title, url });
        if(state.hasEntry) continue;

        const animeStreams = streams.map(item => {
            const stream = selftext.split('\n').find(nestedItem => nestedItem.includes(item.url));
            return stream && `> **[${item.name}](${stream.match(/(?<=\()(.*)(?=\))/g)[0]})**`;
        }).filter(Boolean);

        const animeAggregators = aggregators.map(item => {
            const aggregator = selftext.split('\n').find(nestedItem => nestedItem.includes(item.url));
            return aggregator && `> **[${item.name}](${aggregator.match(/(?<=\()(.*)(?=\))/g)[0]})**`;
        }).filter(Boolean);
        
        const aggregatorMAL = animeAggregators.find(item => item.includes('myanimelist.net'));
        if(!aggregatorMAL) continue;

        const id = aggregatorMAL.match(/\((.*?)\)/g)[0].match(/\d+/g)[0];
        const { episodes, score, image } = await getAnimeDetails(id);

        webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(formatTitle(title.replace(/Discussion|discussion/, '')))
                .setURL(url)
                .setThumbnail(image || '')
                .addField('**Streams**', animeStreams.length > 0 ? animeStreams.join('\n') : 'N/A')
                .addField('**Trackers**', animeAggregators.length > 0 ? animeAggregators.join('\n') : 'N/A')
                .addField('**Total episodes**', episodes?.toString() || 'N/A', true)
                .addField('**Score**', score?.toString() || 'N/A', true)
                .setFooter('Powered by Jikan API.')
                .setColor('RANDOM')
        ]});
    }
}

const getAnimeDetails = async id => {        
    const data = await fetchData(`https://api.jikan.moe/v4/anime/${id}`);
    const { episodes, score, images } = data.data;

    return { episodes, score, image: images?.jpg?.large_image_url };
}

export default { getAnime };