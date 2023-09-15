import { RedditApi } from '@luferro/reddit-api';
import { EnumUtil } from '@luferro/shared-utils';

import { Feed, getNewsFeed } from './news.feed';

type News = {
	title: string;
	url: string;
	image?: string;
	publishedAt: Date;
	isYoutubeEmbed?: boolean;
	isTwitterEmbed?: boolean;
};

export const getNews = async () => {
	let news: News[] = [
		...(await RedditApi.getPosts('Games', 'new', 25))
			.filter(({ isCrosspost, isSelf }) => !isCrosspost && !isSelf)
			.map(({ title, url, embedType, publishedAt }) => ({
				title,
				url,
				publishedAt,
				isYoutubeEmbed: embedType === 'youtube.com',
				isTwitterEmbed: embedType === 'twitter.com',
			})),
	];

	for (const source of EnumUtil.enumKeysToArray(Feed)) {
		news = news.concat(
			(await getNewsFeed({ url: Feed[source] })).map(({ title, url, image, publishedAt }) => ({
				title,
				url,
				image,
				publishedAt,
			})),
		);
	}

	return news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
