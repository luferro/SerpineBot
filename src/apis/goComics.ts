import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import { ComicSelection } from '../types/enums';

export const getComics = async (selection: ComicSelection) => {
	const options: Record<ComicSelection, string> = {
		[ComicSelection.Garfield]: 'https://www.gocomics.com/random/garfield',
		[ComicSelection.Peanuts]: 'https://www.gocomics.com/random/peanuts',
		[ComicSelection.GetFuzzy]: 'https://www.gocomics.com/random/getfuzzy',
		[ComicSelection.FowlLanguage]: 'https://www.gocomics.com/random/fowl-language',
		[ComicSelection.CalvinAndHobbes]: 'https://www.gocomics.com/random/calvinandhobbes',
		[ComicSelection.JakeLikesOnions]: 'https://www.gocomics.com/random/jake-likes-onions',
		[ComicSelection.SarahsScribbles]: 'https://www.gocomics.com/random/sarahs-scribbles',
		[ComicSelection.WorryLines]: 'https://www.gocomics.com/random/worry-lines',
	};

	const data = await fetch<string>({ url: options[selection] });
	let $ = load(data);

	const isRedirect = $('body').text().includes('redirected');
	if (isRedirect) {
		const randomUrl = $('a').attr('href')!;
		const randomData = await fetch<string>({ url: randomUrl });
		$ = load(randomData);
	}

	const title = $('.comic').attr('data-feature-name')!;
	const author = $('.comic').attr('creator')!;
	const url = $('.comic').attr('data-url')!;
	const image = $('.comic').attr('data-image') ?? null;

	return {
		image,
		url,
		title: title === author ? title : `${title} by ${author}`,
	};
};
