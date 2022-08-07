import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import * as Youtube from './youtube';
import { XboxWireCategory } from '../types/enums';

export const isGamertagValid = async (gamertag: string) => {
	try {
		await fetch<string>({ url: `https://xboxgamertag.com/search/${gamertag}` });
		return true;
	} catch (error) {
		return false;
	}
};

export const getProfile = async (gamertag: string) => {
	const data = await fetch<string>({ url: `https://xboxgamertag.com/search/${gamertag}` });
	const $ = load(data);

	const name = $('h1').first().text();
	const image = $('.avatar img').first().attr('src');
	const gamerscore = $('.profile-detail-item').first().text().match(/\d/g)?.join('') ?? 0;
	const gamesPlayed = $('.profile-detail-item').last().text().match(/\d/g)?.join('') ?? 0;

	return {
		name,
		image: image ? `https:${image.replace('&w=90&h=90', '')}` : null,
		gamerscore: Number(gamerscore),
		gamesPlayed: Number(gamesPlayed),
	};
};

export const getLatestXboxWireNews = async (category: XboxWireCategory) => {
	const options: Record<typeof category, string> = {
		[XboxWireCategory.Gamepass]: 'https://news.xbox.com/en-us/?s=Xbox+Game+Pass&search-category=news-stories',
		[XboxWireCategory.DealsWithGold]: 'https://news.xbox.com/en-us/?s=Deals+With+Gold&search-category=news-stories',
		[XboxWireCategory.GamesWithGold]: 'https://news.xbox.com/en-us/?s=Games+With+Gold&search-category=news-stories',
		[XboxWireCategory.Podcast]: 'https://news.xbox.com/en-us/podcast/',
	};

	const data = await fetch<string>({ url: options[category] });
	const $ = load(data);

	return $('.media.feed')
		.get()
		.map((element) => {
			const title = $(element).find('.media-body .feed__title a').text();
			const url = $(element).find('.media-body .feed__title a').attr('href')!;
			const image = $(element).find('.media-image a img').attr('src')!;
			const videoUrl = $(element).find('.media-image .video-wrapper').first().attr('data-src');
			const podcastUrl = $(element).find('.media-body .feed__podcast-player iframe').first().attr('src');

			let videoId;
			if (videoUrl) videoId = Youtube.getVideoId(videoUrl?.split('?')[0]);
			if (podcastUrl) videoId = Youtube.getVideoId(podcastUrl);

			return {
				title,
				image,
				url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : url,
			};
		});
};

export const getTopPlayed = async () => {
	const data = await fetch<string>({ url: 'https://www.microsoft.com/pt-pt/store/most-played/games/xbox' });
	const $ = load(data);

	return $('.context-list-page > div')
		.get()
		.map((element, index) => {
			const name = $(element).find('h3').first().text();
			const href = $(element).find('a').attr('href');

			return `\`${index + 1}.\` **[${name}](https://www.xbox.com${href})**`;
		})
		.slice(0, 10);
};

export const getTopSellers = async () => {
	const data = await fetch<string>({ url: 'https://www.microsoft.com/pt-pt/store/top-paid/games/xbox' });
	const $ = load(data);

	return $('.context-list-page > div')
		.get()
		.map((element, index) => {
			const name = $(element).find('h3').first().text();
			const href = $(element).find('a').attr('href');

			return `\`${index + 1}.\` **[${name}](https://www.xbox.com${href})**`;
		})
		.slice(0, 10);
};

export const getUpcoming = async () => {
	const data = await fetch<string>({ url: 'https://www.microsoft.com/pt-pt/store/coming-soon/games/xbox' });
	const $ = load(data);

	return $('.context-list-page > div')
		.get()
		.map((element, index) => {
			const name = $(element).find('h3').first().text();
			const href = $(element).find('a').attr('href');

			return `\`${index + 1}.\` **[${name}](https://www.xbox.com${href})**`;
		})
		.slice(0, 10);
};
