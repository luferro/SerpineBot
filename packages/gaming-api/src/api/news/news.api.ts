import { EnumUtil } from '@luferro/shared-utils';

import { Feed, getNewsFeed } from './news.feed';

export const getLatestNews = async () => {
	let news: Awaited<ReturnType<typeof getNewsFeed>> = [];
	for (const source of EnumUtil.enumKeysToArray(Feed)) {
		news = news.concat(await getNewsFeed({ url: Feed[source] }));
	}
	return news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
