import { RedditApi } from '@luferro/reddit-api';

import { Feeds } from '../../../types/args';
import { getNewsFeed } from './news.feed';

type News = {
	title: string;
	url: string;
	publishedAt: Date;
	image?: string;
	isYoutubeEmbed?: boolean;
	isTwitterEmbed?: boolean;
};

export const getNews = async ({ feeds }: Partial<Feeds>) => {
	const data: News[] = [
		...(await RedditApi.getPosts({ subreddit: 'Games', sort: 'new', limit: 25 }))
			.filter(({ isCrosspost, isSelf }) => !isCrosspost && !isSelf)
			.map(({ title, url, isYoutubeEmbed, isTwitterEmbed, publishedAt }) => ({
				title,
				url,
				publishedAt,
				isYoutubeEmbed,
				isTwitterEmbed,
			})),
	];

	for (const url of feeds ?? []) {
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
