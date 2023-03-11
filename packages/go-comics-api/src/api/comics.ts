import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

import type { ComicSelection } from '../types/category';

const ComicSelections = Object.freeze<Record<ComicSelection, string>>({
	'Garfield': 'https://www.gocomics.com/random/garfield',
	'Peanuts': 'https://www.gocomics.com/random/peanuts',
	'Get Fuzzy': 'https://www.gocomics.com/random/getfuzzy',
	'Fowl Language': 'https://www.gocomics.com/random/fowl-language',
	'Calvin And Hobbes': 'https://www.gocomics.com/random/calvinandhobbes',
	'Jake Likes Onions': 'https://www.gocomics.com/random/jake-likes-onions',
	'Sarahs Scribbles': 'https://www.gocomics.com/random/sarahs-scribbles',
	'Worry Lines': 'https://www.gocomics.com/random/worry-lines',
});

export const getRandomComicPage = async (selection: ComicSelection) => {
	const data = await FetchUtil.fetch<string>({ url: ComicSelections[selection] });
	let $ = load(data);

	const isRedirect = $('body').text().includes('redirected');
	if (isRedirect) {
		const randomUrl = $('a').attr('href');
		if (!randomUrl) throw new Error(`Couldn't find a random comic for ${selection}`);

		const randomData = await FetchUtil.fetch<string>({ url: randomUrl });
		$ = load(randomData);
	}

	const title = $('.comic').attr('data-feature-name') ?? null;
	const author = $('.comic').attr('creator') ?? null;
	const url = $('.comic').attr('data-url') ?? null;
	const image = $('.comic').attr('data-image') ?? null;

	return {
		image,
		url,
		title: title === author ? title : `${title} by ${author}`,
	};
};
