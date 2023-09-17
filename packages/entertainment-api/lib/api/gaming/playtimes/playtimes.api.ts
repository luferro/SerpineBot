import { SearchEngine } from '@luferro/scraper';

import { Id, Query } from '../../../types/args';
import { getPlaytimeData } from './playtimes.scraper';

export const search = async ({ query }: Query) => {
	const results = await SearchEngine.search({ query: `${query} site:https://howlongtobeat.com` });
	return {
		id: results[0]?.url.split('/').at(-1) ?? null,
	};
};

export const getPlaytimesById = async ({ id }: Id) => await getPlaytimeData({ id });
