import { load } from 'cheerio';
import { fetch } from '../services/fetch';

const parse = (text: string) => {
	if (!/\d+/.test(text)) return;

	const [time, unit] = text.split(' ');
	if (unit === 'Mins') return `${time}m`;
	if (time.includes('½')) return `${parseInt(time.substring(0, time.indexOf('½'))) + 0.5}h`;
	return `${time}h`;
};

export const search = async (title: string) => {
	const formData = new URLSearchParams();
	formData.append('queryString', title);
	formData.append('t', 'games');
	formData.append('sorthead', 'popular');
	formData.append('sortd', 'Normal Order');
	formData.append('plat', '');
	formData.append('length_type', 'main');
	formData.append('length_min', '');
	formData.append('length_max', '');
	formData.append('detail', '0');

	const data = await fetch<string>('https://howlongtobeat.com/search_results?page=1', 'POST', formData);
	const $ = load(data);

	const name = $('ul').first().find('li').first().find('h3 a').text();
	const src = $('ul').first().find('li').first().find('img').attr('src');
	const image = src && `https://howlongtobeat.com${src}`;

	let main: string | undefined;
	let mainExtra: string | undefined;
	let completionist: string | undefined;
	for (const element of $('.search_list_details_block').first().find('div').get()) {
		const label = $(element).text();
		const isMainLabel = ['Main Story', 'Single-Player', 'Solo'].some((labelText) => label.startsWith(labelText));
		const isMainExtraLabel = ['Main + Extra', 'Co-Op'].some((labelText) => label.startsWith(labelText));
		const isCompletionistLabel = ['Completionist', 'Vs.'].some((labelText) => label.startsWith(labelText));

		const time = $(element).next().text();
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
