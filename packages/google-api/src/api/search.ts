import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

export const search = async (query: string) => {
	const data = await FetchUtil.fetch<string>({ url: `https://www.google.com/search?q=${query}` });
	const $ = load(data);

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

			return {
				name,
				url,
			};
		})
		.filter((element): element is NonNullable<typeof element> => !!element);
};
