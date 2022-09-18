import type { Country } from '../types/news';
import type { Article, NewsResponse } from '../types/response';
import { FetchUtil, StringUtil } from '@luferro/shared-utils';

const CountryCodes = Object.freeze<Record<Country, string>>({
	'Argentina': 'ar',
	'Australia': 'au',
	'Austria': 'at',
	'Bangladesh': 'bd',
	'Belgium': 'be',
	'Brazil': 'br',
	'Bulgaria': 'bg',
	'Canada': 'ca',
	'Chile': 'cl',
	'China': 'cn',
	'Colombia': 'co',
	'Cuba': 'cu',
	'Czech Republic': 'cz',
	'Egypt': 'eg',
	'France': 'fr',
	'Germany': 'de',
	'Greece': 'gr',
	'Hong kong': 'hk',
	'Hungary': 'hu',
	'India': 'in',
	'Indonesia': 'id',
	'Iraq': 'iq',
	'Ireland': 'ie',
	'Israel': 'il',
	'Italy': 'it',
	'Japan': 'jp',
	'Kazakhstan': 'kz',
	'Latvia': 'lv',
	'Lebanon': 'lb',
	'Lithuania': 'lt',
	'Malaysia': 'my',
	'Mexico': 'mx',
	'Morocco': 'ma',
	'Netherland': 'nl',
	'New Zealand': 'nz',
	'Nigeria': 'ng',
	'North Korea': 'kp',
	'Norway': 'no',
	'Pakistan': 'pk',
	'Peru': 'pe',
	'Philippines': 'ph',
	'Poland': 'pl',
	'Portugal': 'pt',
	'Romania': 'ro',
	'Russia': 'ru',
	'Saudi Arabia': 'sa',
	'Serbia': 'rs',
	'Singapore': 'sg',
	'Slovakia': 'sk',
	'Slovenia': 'si',
	'South africa': 'za',
	'South korea': 'kr',
	'Spain': 'es',
	'Sweden': 'se',
	'Switzerland': 'ch',
	'Taiwan': 'tw',
	'Thailand': 'th',
	'Turkey': 'tr',
	'Ukraine': 'ua',
	'United Arab Emirates': 'ae',
	'United Kingdom': 'gb',
	'United States of America': 'us',
	'Venezuela': 've',
});

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

export const getNewsByCountry = async (country: Country) => {
	const countryCode = CountryCodes[country];
	const { results } = await FetchUtil.fetch<NewsResponse<Article>>({
		url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=${countryCode} `,
	});

	return results
		.map(({ source_id, title, link, content, description, image_url, pubDate }) => ({
			title: StringUtil.truncate(title),
			url: link,
			publisher: source_id,
			publishedAt: new Date(pubDate),
			description: content ? StringUtil.truncate(content, 512) : description,
			image: image_url?.startsWith('http') ? image_url : null,
		}))
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 10);
};

export const getWorldNews = async () => {
	const { results } = await FetchUtil.fetch<NewsResponse<Article>>({
		url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&category=world `,
	});

	return results
		.map(({ source_id, title, link, content, description, image_url, pubDate }) => ({
			title: StringUtil.truncate(title),
			url: link,
			publisher: source_id,
			publishedAt: new Date(pubDate),
			description: content ? StringUtil.truncate(content, 512) : description,
			image: image_url?.startsWith('http') ? image_url : null,
		}))
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 10);
};
