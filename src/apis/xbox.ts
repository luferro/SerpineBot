import { load } from 'cheerio';
import { fetch } from '../services/fetch';
import * as Youtube from './youtube';
import { XboxWireCategories } from '../types/categories';

export const getLatestXboxWireNews = async (category: XboxWireCategories) => {
    const options: Record<string, string> = {
        'gamepass': 'https://news.xbox.com/en-us/xbox-game-pass/',
        'deals with gold': 'https://majornelson.com/category/xbox-store/',
        'games with gold': 'https://news.xbox.com/en-us/games/'
    }

    const data = await fetch<string>(options[category]);
    const $ = load(data);

    const articles = [];
    for(const item of $('.media.feed').get()) {
        const title = $(item).find('.media-body .feed__title a').text();
        const href = $(item).find('.media-body .feed__title a').attr('href')!;
        const image = $(item).find('.media-image a img').attr('src')!;
        const video = $(item).find('.media-image .video-wrapper').first().attr('data-src');
        const videoId = video && Youtube.getVideoId(video.split('?')[0]);
        const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : href;

        const isGamepassPost = category === 'gamepass' && (title.toLowerCase().includes('coming soon') || title.toLowerCase().includes('game pass'));
        const isDealsWithGoldPost = category === 'deals with gold' && title.toLowerCase().includes('deals with gold');
        const isGamesWithGoldPost = category === 'games with gold' && title.toLowerCase().includes('games with gold');
        if(!isGamepassPost && !isDealsWithGoldPost && !isGamesWithGoldPost) continue;

        articles.push({
            title,
            url,
            image
        });
    }

    return articles[0];
}