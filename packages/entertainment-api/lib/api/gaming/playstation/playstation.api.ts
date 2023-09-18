import { Feeds } from '../../../types/args';
import { getPlaystationBlogFeed } from './playstation.feed';

export const getBlog = async ({ feeds }: Feeds) => {
	const data = [];
	for (const url of feeds) {
		data.push(...(await getPlaystationBlogFeed({ url })));
	}
	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
