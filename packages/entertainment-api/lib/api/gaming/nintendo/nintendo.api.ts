import { RedditApi } from '@luferro/reddit-api';

export const getNews = async () => {
	const data = await RedditApi.getPostsByFlair({
		subreddit: 'NintendoSwitch',
		sort: 'new',
		flairs: ['News', 'Nintendo Official'],
	});

	return data.map(({ title, url, embedType }) => ({
		title,
		url,
		isYoutubeEmbed: embedType === 'youtube.com',
		isTwitterEmbed: embedType === 'twitter.com',
	}));
};
