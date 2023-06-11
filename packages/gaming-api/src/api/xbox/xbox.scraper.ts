import { GoogleApi } from '@luferro/google-api';
import { InteractiveScraper, StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	GAMERTAG = 'https://xboxgamertag.com/search/:gamertag',
	LATEST_PODCAST = 'https://news.xbox.com/en-us/podcast/',
	LATEST_GAME_PASS = 'https://news.xbox.com/en-us/?s=Xbox+Game+Pass&search-category=news-stories',
	LATEST_DEALS_WITH_GOLD = 'https://news.xbox.com/en-us/?s=Deals+With+Gold&search-category=news-stories',
	LATEST_GAMES_WITH_GOLD = 'https://news.xbox.com/en-us/?s=Games+With+Gold&search-category=news-stories',
	TOP_PLAYED = 'https://www.microsoft.com/pt-pt/store/most-played/games/xbox',
	TOP_SELLERS = 'https://www.microsoft.com/pt-pt/store/top-paid/games/xbox',
	UPCOMING_GAMES = 'https://www.microsoft.com/pt-pt/store/coming-soon/games/xbox',
}

export const getGamertagDetails = async (url: string) => {
	const html = await InteractiveScraper.getHtml({ url });
	const $ = await StaticScraper.loadHtml({ html });

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

export const getNewsList = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	return $('.media.feed')
		.get()
		.map((element) => {
			const title = $(element).find('.media-body .feed__title a').text();
			const url = $(element).find('.media-body .feed__title a').attr('href')!;
			const image = $(element).find('.media-image a img').attr('src')!;
			const videoEmbedUrl = $(element).find('.media-image .video-wrapper').first().attr('data-src');
			const podcastEmbedUrl = $(element).find('.media-body .feed__podcast-player iframe').first().attr('src');

			const videoUrl = videoEmbedUrl
				? `https://www.youtube.com/watch?v=${GoogleApi.youtube.getVideoId(videoEmbedUrl)}`
				: null;

			const podcastUrl = podcastEmbedUrl
				? `https://www.youtube.com/watch?v=${GoogleApi.youtube.getVideoId(podcastEmbedUrl)}`
				: null;

			return {
				title: podcastUrl ? `Xbox Podcast | ${title}` : title,
				image: image ? image.split('?')[0] : null,
				isVideo: Boolean(videoUrl ?? podcastUrl),
				url: videoUrl ?? podcastUrl ?? url,
			};
		});
};

export const getXboxList = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	return $('section > ul li')
		.get()
		.slice(0, 10)
		.map((element, index) => {
			const position = index + 1;
			const name = $(element).find('.card-body a').text();
			const url = $(element).find('.card-body a').attr('href')!;

			return { position, name, url };
		});
};
