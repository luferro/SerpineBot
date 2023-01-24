import type { XboxWireCategory } from '../types/category';
import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';
import { YoutubeApi } from '@luferro/google-api';

const BlogCategories = Object.freeze<Record<XboxWireCategory, string>>({
	'Game Pass': 'https://news.xbox.com/en-us/?s=Xbox+Game+Pass&search-category=news-stories',
	'Deals With Gold': 'https://news.xbox.com/en-us/?s=Deals+With+Gold&search-category=news-stories',
	'Games With Gold': 'https://news.xbox.com/en-us/?s=Games+With+Gold&search-category=news-stories',
	'Podcast': 'https://news.xbox.com/en-us/podcast/',
});

export const getCategories = () => Object.keys(BlogCategories) as XboxWireCategory[];

export const isGamertagValid = async (gamertag: string) => {
	try {
		await FetchUtil.fetch<string>({ url: `https://xboxgamertag.com/search/${gamertag}` });
		return true;
	} catch (error) {
		return false;
	}
};

export const getProfile = async (gamertag: string) => {
	const data = await FetchUtil.fetch<string>({ url: `https://xboxgamertag.com/search/${gamertag}` });
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
	const data = await FetchUtil.fetch<string>({ url: BlogCategories[category] });
	const $ = load(data);

	return $('.media.feed')
		.get()
		.map((element) => {
			const title = $(element).find('.media-body .feed__title a').text();
			const url = $(element).find('.media-body .feed__title a').attr('href')!;
			const image = $(element).find('.media-image a img').attr('src')!;
			const videoEmbedUrl = $(element).find('.media-image .video-wrapper').first().attr('data-src');
			const podcastEmbedUrl = $(element).find('.media-body .feed__podcast-player iframe').first().attr('src');

			const videoUrl = videoEmbedUrl
				? `https://www.youtube.com/watch?v=${YoutubeApi.getVideoId(videoEmbedUrl)}`
				: null;

			const podcastUrl = podcastEmbedUrl
				? `https://www.youtube.com/watch?v=${YoutubeApi.getVideoId(podcastEmbedUrl)}`
				: null;

			return {
				title: podcastUrl ? `Xbox Podcast | ${title}` : title,
				image: image ? image.split('?')[0] : null,
				isVideo: Boolean(videoUrl ?? podcastUrl),
				url: videoUrl ?? podcastUrl ?? url,
			};
		});
};

export const getTopPlayed = async () => {
	const data = await FetchUtil.fetch<string>({
		url: 'https://www.microsoft.com/pt-pt/store/most-played/games/xbox',
	});
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
	const data = await FetchUtil.fetch<string>({
		url: 'https://www.microsoft.com/pt-pt/store/top-paid/games/xbox',
	});
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
	const data = await FetchUtil.fetch<string>({
		url: 'https://www.microsoft.com/pt-pt/store/coming-soon/games/xbox',
	});
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
