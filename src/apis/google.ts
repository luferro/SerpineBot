import { load } from 'cheerio';
import { fetch } from '../services/fetch';

export const search = async (query: string) => {
	const data = await fetch<string>(`https://www.google.com/search?q=${query}`);
	const $ = load(data);

	return $('#search')
		.children('div')
		.children('div')
		.children()
		.get()
		.map((element) => {
			if (Object.keys(element.attribs).length === 1) return;

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
