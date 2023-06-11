import { StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	SEARCH_PAGE = 'https://www.google.com/search?q=:query',
}

export const getList = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });

	return $('#search')
		.children('div')
		.children('div')
		.children()
		.get()
		.map((element) => {
			const isRelevant = $(element).find('cite').length > 0;
			if (!isRelevant) return;

			const name = $(element).find('h3').text();
			const url = $(element).find('a').attr('href')!;
			if (!name && !url) return;

			return { name, url };
		})
		.filter((element): element is NonNullable<typeof element> => !!element);
};
