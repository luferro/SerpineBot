import { RSS, StaticScraper } from '@luferro/scraper';

import { Url } from '../../../types/args';

export const getNewsFeed = async ({ url }: Url) => {
	const raw = await RSS.getFeed({ url });
	return raw.items.map(({ title, link, content, 'content:encoded': encodedContent, contentSnippet, isoDate }) => {
		const $ = StaticScraper.loadHtml({ html: encodedContent ?? content });
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
