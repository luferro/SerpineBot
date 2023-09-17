import { RssModel } from '@luferro/database';

import { getPlaystationBlogFeed } from './playstation.feed';

export const getBlog = async () => {
	const data = [];
	for (const url of await RssModel.getFeeds({ key: 'gaming.playstation' })) {
		data.push(...(await getPlaystationBlogFeed({ url })));
	}
	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
