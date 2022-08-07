import { load } from 'cheerio';
import * as Google from '../apis/google';
import { fetch } from '../utils/fetch';

const parse = (text: string) => {
	if (!/\d+/.test(text)) throw new Error(`String "${text}" can't be parsed.`);

	const [time, unit] = text.split(' ');
	if (unit === 'Mins') return `${time}m`;
	if (time.includes('½')) return `${parseInt(time.substring(0, time.indexOf('½'))) + 0.5}h`;
	return `${time}h`;
};

export const search = async (title: string) => {
	const results = await Google.search(`${title} site:https://howlongtobeat.com`);
	if (results.length === 0) throw new Error(`No results were found for ${title}`);

	const params = new URL(results[0].url).searchParams;
	return params.get('id');
};

export const getGameById = async (id: string) => {
	const data = await fetch<string>({ url: `https://howlongtobeat.com/game?id=${id}` });
	const $ = load(data);

	const name = $('.profile_header_game .profile_header').text().trim();
	const src = $('.profile_header_game .game_image img').attr('src') ?? null;
	const image = src && `https://howlongtobeat.com${src}`;

	let main: string | null = null;
	let mainExtra: string | null = null;
	let completionist: string | null = null;
	for (const element of $('.game_times ul li').get()) {
		const label = $(element).find('h5').text();
		const isMainLabel = ['Main Story', 'Single-Player', 'Solo'].some((labelText) => label.startsWith(labelText));
		const isMainExtraLabel = ['Main + Extra', 'Co-Op'].some((labelText) => label.startsWith(labelText));
		const isCompletionistLabel = ['Completionist', 'Vs.'].some((labelText) => label.startsWith(labelText));

		const time = $(element).find('div').text();
		const playtime = parse(time);

		if (isMainLabel) main = playtime;
		if (isMainExtraLabel) mainExtra = playtime;
		if (isCompletionistLabel) completionist = playtime;
	}

	return {
		name,
		image,
		playtimes: {
			main,
			mainExtra,
			completionist,
		},
	};
};
