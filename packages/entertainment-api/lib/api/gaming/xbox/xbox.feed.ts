import { RSS, StaticScraper, Youtube } from '@luferro/scraper';
import { DateUtil } from '@luferro/shared-utils';

import { Url } from '../../../types/args';

export const getXboxWireFeed = async ({ url }: Url) => {
	const raw = await RSS.getFeed({ url });
	return Promise.all(
		raw.items
			.filter(({ isoDate }) => isoDate && DateUtil.isDateToday({ date: new Date(isoDate) }))
			.map(async ({ title, link, contentSnippet, 'content:encoded': encodedContent, isoDate }) => {
				let $ = StaticScraper.loadHtml({ html: encodedContent });
				let image = $('.post-header__image img').attr('src') ?? null;
				if (!image && link && !Youtube.isVideo({ url: link })) {
					$ = await StaticScraper.loadUrl({ url: link });
					image = $('.post-header__image img').attr('src')!;
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
