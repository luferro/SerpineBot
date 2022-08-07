import { load } from 'cheerio';
import { fetch } from '../utils/fetch';

export const getLatestNintendoNews = async () => {
	const data = await fetch<string>({ url: 'https://www.nintendo.com/whatsnew/' });
	let $ = load(data);

	return await Promise.all(
		$('#main section')
			.children()
			.first()
			.children('div:nth-child(3)')
			.children()
			.get()
			.map(async (element) => {
				const title = $(element).find('h3').first().text();
				const href = $(element).find('a').first().attr('href')!;

				const url = `https://www.nintendo.com${href}`;

				const data = await fetch<string>({ url });
				$ = load(data);

				const script = $('script').first().text();
				const image = script ? (JSON.parse(script).image as string) : null;

				return {
					title,
					image,
					url,
				};
			}),
	);
};
