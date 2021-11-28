import { MessageEmbed, WebhookClient } from 'discord.js';
import { load } from 'cheerio';
import fetch from 'node-fetch';
import { getVideoID } from '../utils/youtube.js';
import { manageState } from '../handlers/webhooks.js';

const getXbox = async type => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_XBOX });

    const getURL = type => {
        const options = {
            'gamepass': 'https://news.xbox.com/en-us/xbox-game-pass',
            'consoles': 'https://news.xbox.com/en-us/consoles',
            'deals': 'https://majornelson.com/category/xbox-store'
        }
        return options[type];
    }
    const categoryURL = getURL(type.toLowerCase());

    const res = await fetch(categoryURL);
    if(!res.ok) return;
    const body = await res.text();
    const $ = load(body);

    const title = $('.archive-main .media .media-body .feed__title a').first().text();
    const link = $('.archive-main .media .media-body .feed__title a').first().attr('href');
    const image = $('.archive-main .media .media-image .video-wrapper img').first().attr('src') || $('.archive-main .media .media-image a img').first().attr('src');

    const hasVideo = $('.archive-main .media .media-image').first().children().hasClass('video-wrapper');
    const video = hasVideo && $('.archive-main .media .media-image .video-wrapper').first().attr('data-src');
    const videoID = hasVideo && getVideoID(video.split('?')[0]);
    const url = hasVideo ? `https://www.youtube.com/watch?v=${videoID}` : link;

    const state = manageState(type.toLowerCase(), url);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = [{ type: 'gamepass', title: 'xbox game pass'}, { type: 'deals', title: 'deals with gold' }].some(item => type.toLowerCase() === item.type && !title.toLowerCase().includes(item.title))
    if(isInvalid) return;

    if(hasVideo) return webhook.send({ content: `**${title}**\n${url}` });

    if(type.toLowerCase() === 'gamepass' && title.toLowerCase().includes('coming soon')) {
        return webhook.send({ embeds: [
            new MessageEmbed()
                .setTitle(title)
                .setURL(url)
                .setImage(image)
                .setColor('RANDOM')
        ]});
    }

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setThumbnail(image)
            .setColor('RANDOM')
    ]});
}

export default { getXbox };