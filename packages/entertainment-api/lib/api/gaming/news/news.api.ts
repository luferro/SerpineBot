import { RssModel } from '@luferro/database';
import { RedditApi } from '@luferro/reddit-api';

import { getNewsFeed } from './news.feed';

type News = {
	title: string;
	url: string;
	publishedAt: Date;
	image?: string;
	isYoutubeEmbed?: boolean;
	isTwitterEmbed?: boolean;
};

export const getNews = async () => {
	const data: News[] = [
		...(await RedditApi.getPosts({ subreddit: 'Games', sort: 'new', limit: 25 }))
			.filter(({ isCrosspost, isSelf }) => !isCrosspost && !isSelf)
			.map(({ title, url, embedType, publishedAt }) => ({
				title,
				url,
				publishedAt,
				isYoutubeEmbed: embedType === 'youtube.com',
				isTwitterEmbed: embedType === 'twitter.com',
			})),
	];

	for (const url of await RssModel.getFeeds({ key: 'gaming.news' })) {
		data.push(
			...(await getNewsFeed({ url })).map(({ title, url, image, publishedAt }) => ({
				title,
				url,
				image,
				publishedAt,
			})),
		);
	}

	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
