import { RSS, StaticScraper } from '@luferro/scraper';
import { DateUtil } from '@luferro/shared-utils';

import { Url } from '../../../types/args';

export const getPlaystationBlogFeed = async ({ url }: Url) => {
	const raw = await RSS.getFeed({ url });
	return Promise.all(
		raw.items
			.filter(({ isoDate }) => isoDate && DateUtil.isToday({ date: new Date(isoDate) }))
			.map(async ({ title, link, contentSnippet, isoDate }) => {
				let image: string | null = null;
				if (link) {
					const $ = await StaticScraper.loadUrl({ url: link });
					image = $('.featured-asset').first().attr('src')!;
				}

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
