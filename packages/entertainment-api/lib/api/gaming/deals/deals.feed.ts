import { RSS, StaticScraper } from '@luferro/scraper';

import { Url } from '../../../types/args';

export const getDealsFeed = async ({ url }: Url) => {
	const raw = await RSS.getFeed({ url });
	return raw.items.map(({ title, link, content, contentSnippet, isoDate }) => {
		const $ = StaticScraper.loadHtml({ html: content! });
		const image = $('img').attr('src');
		return {
			title: title!,
			url: link!,
			description: contentSnippet!,
			image: image!,
			publishedAt: isoDate ? new Date(isoDate) : new Date(),
		};
	});
};
