import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getVideoID } from '../utils/youtube.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const categories = [
    { name: 'Games With Gold', url: 'https://news.xbox.com/en-us/games' },
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

            const results = $('.archive-main .media').get().map(element => {
                const title = $(element).find('.media-body .feed__title a').text();
                const href = $(element).find('.media-body .feed__title a').attr('href');
                const image = $(element).find('.media-image a img').attr('src');
                const hasVideo = $(element).find('.media .media-image').children().hasClass('video-wrapper');
                const video = $(element).find('.media-image .video-wrapper').first().attr('data-src');
                const videoID = hasVideo && getVideoID(video.split('?')[0]);
                const url = hasVideo ? `https://www.youtube.com/watch?v=${videoID}` : href;

                const isGamepassPost = category.name === 'Gamepass' && (title.toUpperCase().includes('COMING SOON') || title.toUpperCase().includes('GAME PASS'));
                const isDealsWithGoldPost = category.name === 'Deals With Gold' && title.toUpperCase().includes('DEALS WITH GOLD');
                const isGamesWithGoldPost = category.name === 'Games With Gold' && title.toUpperCase().includes('GAMES WITH GOLD');
                if(!isGamepassPost && !isDealsWithGoldPost && !isGamesWithGoldPost) return;

                return { title, url, image, hasVideo };
            }).filter(Boolean);
            if(results.length === 0) continue

            const { 0: { title, url, image, hasVideo } } = results;

            const state = manageState(category.name, { title, url });
            if(state.hasEntry) continue;

            if(hasVideo) {
                webhook.send({ content: `**${formatTitle(title)}**\n${url}` });
                continue;
            }

            const message = new MessageEmbed()
                .setTitle(formatTitle(title))
                .setURL(url)
                .setColor('RANDOM');
            category.name === 'Gamepass' && title.toUpperCase().includes('COMING SOON') ? message.setImage(image) : message.setThumbnail(image);

            webhook.send({ embeds: [message] });
        }
    }
}

export default { getXbox };