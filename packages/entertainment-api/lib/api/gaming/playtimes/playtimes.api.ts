import { SearchEngine } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getPlaytimesData } from './playtimes.scraper';

export const search = async (query: string) => {
	const results = await SearchEngine.search({ query: `${query} site:https://howlongtobeat.com` });
	if (results.length === 0) return { id: null };

	const { url } = results[0];
	const { searchParams } = new URL(url);
	return { id: searchParams.get('id') ?? url.split('/').at(-1) ?? null };
};

export const getPlaytimesById = async (id: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAME, id);
	return await getPlaytimesData(url);
};
