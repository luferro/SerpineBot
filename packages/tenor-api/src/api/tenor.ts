import { FetchUtil } from '@luferro/shared-utils';

import type { TenorResponse } from '../types/response';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

export const getRandomGif = async (query: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const { results } = await FetchUtil.fetch<TenorResponse>({
		url: `https://g.tenor.com/v1/search?q=${query}&key=${API_KEY}&limit=50`,
	});

	return {
		gif: results[Math.floor(Math.random() * results.length)].itemurl,
	};
};
