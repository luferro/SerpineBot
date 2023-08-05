import { RSS } from '@luferro/scraper/lib';
import { DateUtil } from '@luferro/shared-utils';

import { getBlogPostImage } from './playstation.scraper';

export enum Feed {
	PLAYSTATION_PLUS = 'https://blog.playstation.com/tag/playstation-plus/feed',
	PLAYSTATION_STORE = 'https://blog.playstation.com/tag/playstation-store/feed',
	STATE_OF_PLAY = 'https://blog.playstation.com/tag/state-of-play/feed',
}

export const getPlaystationFeed = async ({ url }: { url: Feed }) => mapFeed({ data: await RSS.getFeed({ url }) });

const mapFeed = ({ data }: { data: Awaited<ReturnType<typeof RSS.getFeed>> }) => {
	return Promise.all(
		data.items
			.filter(({ isoDate }) => isoDate && DateUtil.isDateToday(new Date(isoDate)))
			.map(async ({ title, link, contentSnippet }) => {
				const image = link ? await getBlogPostImage(link) : null;
				return { title: title!, url: link!, description: contentSnippet!, image };
			}),
	);
};
