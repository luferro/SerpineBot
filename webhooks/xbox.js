import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getVideoID } from '../utils/youtube.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const categories = [
    { name: 'Consoles', url: 'https://news.xbox.com/en-us/consoles' },
    { name: 'Gamepass', url: 'https://news.xbox.com/en-us/xbox-game-pass' },
    { name: 'Deals With Gold', url: 'https://majornelson.com/category/xbox-store' }
];

const getXbox = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const webhook = await getWebhook(client, guild, 'Xbox');
        if(!webhook) continue;

        for(const category of categories) {
            const data = await fetchData(category.url);
            const $ = load(data);

            const title = $('.archive-main .media .media-body .feed__title a').first().text();
            const href = $('.archive-main .media .media-body .feed__title a').first().attr('href');
            const image = $('.archive-main .media .media-image a img').first().attr('src');
            const hasVideo = $('.archive-main .media .media-image').first().children().hasClass('video-wrapper');
            const video = hasVideo && $('.archive-main .media .media-image .video-wrapper').first().attr('data-src');
            const videoID = hasVideo && getVideoID(video.split('?')[0]);
            const url = hasVideo ? `https://www.youtube.com/watch?v=${videoID}` : href;

            const isInvalid = [{ category: 'Gamepass', title: 'xbox game pass'}, { category: 'Deals With Gold', title: 'deals with gold' }].some(item => item.category === category.name && !title.toLowerCase().includes(item.title));

            const state = manageState(category.name, { title, url });
            if(state.hasEntry || isInvalid) continue;

            if(hasVideo) {
                webhook.send({ content: `**${formatTitle(title)}**\n${url}` });
                continue;
            }

            const message = new MessageEmbed()
                .setTitle(formatTitle(title))
                .setURL(url)
                .setColor('RANDOM');
            category.name === 'Gamepass' && title.toLowerCase().includes('coming soon') ? message.setThumbnail(image) : message.setImage(image);

            webhook.send({ embeds: [message] });
        }
    }
}

export default { getXbox };