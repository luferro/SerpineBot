import type { Country } from '../types/news';
import type { Article, NewsResponse, Source } from '../types/response';
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

const sources = {
	LOCAL: new Map<string, Pick<Source, 'name' | 'url'>>(),
	WORLD: new Map<string, Pick<Source, 'name' | 'url'>>(),
};

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

const loadSources = async (country?: Country) => {
	const baseUrl = `https://newsdata.io/api/1/sources?apikey=${API_KEY}`;
	const url = baseUrl.concat(country ? `&country=${CountryCodes[country]}` : '&language=en&category=world');

	const { results } = await FetchUtil.fetch<NewsResponse<Source>>({ url });

	for (const { id, name, url } of results) {
		sources[country ? 'LOCAL' : 'WORLD'].set(id, { name, url });
	}
};

const getSourceFromId = async (id: string, country?: Country) => {
	if (!country && sources.WORLD.size === 0) await loadSources();
	if (country && sources.LOCAL.size === 0) await loadSources(country);

	return sources[country ? 'LOCAL' : 'WORLD'].get(id);
};

export const getNews = async (country?: Country) => {
	const baseUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}`;
	const url = baseUrl.concat(
		country ? `&country=${CountryCodes[country]}&category=top` : '&language=en&category=world',
	);

	const { results } = await FetchUtil.fetch<NewsResponse<Article>>({ url });

	return await Promise.all(
		results.map(async (article) => {
			const source = await getSourceFromId(article.source_id, country);

			return {
				title: StringUtil.truncate(article.title),
				url: article.link,
				publishedAt: new Date(article.pubDate),
				description: article.content ? StringUtil.truncate(article.content, 512) : article.description,
				image: article.image_url?.startsWith('http') ? article.image_url : null,
				publisher: {
					name: source?.name ?? null,
					url: source?.url ?? null,
				},
			};
		}),
	);
};
