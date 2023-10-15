import { RSS } from '@luferro/scraper';
import { DateUtil } from '@luferro/shared-utils';

import { Url } from '../../../types/args';
import { getImage } from './playstation.scraper';

export const getPlaystationBlogFeed = async ({ url }: Url) => {
	const raw = await RSS.getFeed({ url });
	return Promise.all(
		raw.items
			.filter(({ isoDate }) => isoDate && DateUtil.isDateToday({ date: new Date(isoDate) }))
			.map(async ({ title, link, contentSnippet, isoDate }) => {
				const image = link ? await getImage({ url: link }) : null;
				return {
					title: title!,
					url: link!,
					description: contentSnippet!,
					publishedAt: isoDate ? new Date(isoDate) : new Date(),
					image,
				};
			}),
	);
};
