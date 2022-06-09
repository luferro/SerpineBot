import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import * as Youtube from './youtube';
import { XboxWireCategories } from '../types/categories';

export const getLatestXboxWireNews = async (category: XboxWireCategories) => {
	const options: Record<string, string> = {
		'gamepass': 'https://news.xbox.com/en-us/xbox-game-pass/',
		'deals with gold': 'https://majornelson.com/category/xbox-store/',
		'games with gold': 'https://news.xbox.com/en-us/games/',
	};

	const data = await fetch<string>({ url: options[category] });
	const $ = load(data);

	return $('.media.feed')
		.get()
		.map((element) => {
			const title = $(element).find('.media-body .feed__title a').text();
			const href = $(element).find('.media-body .feed__title a').attr('href')!;
			const image = $(element).find('.media-image a img').attr('src')!;
			const video = $(element).find('.media-image .video-wrapper').first().attr('data-src');
			const videoId = video && Youtube.getVideoId(video.split('?')[0]);
			const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : href;

			const isGamepassPost =
				category === 'gamepass' &&
				title.toLowerCase().includes('coming soon') &&
				title.toLowerCase().includes('game pass');
			const isDealsWithGoldPost =
				category === 'deals with gold' && title.toLowerCase().includes('deals with gold');
			const isGamesWithGoldPost =
				category === 'games with gold' && title.toLowerCase().includes('games with gold');
			if (!isGamepassPost && !isDealsWithGoldPost && !isGamesWithGoldPost) return;

			return {
				title,
				url,
				image,
			};
		})
		.filter((element): element is NonNullable<typeof element> => !!element);
};
