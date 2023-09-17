import { SearchEngine } from '@luferro/scraper';

import { Id, Query } from '../../../types/args';
import { getComicData } from './go-comics.scraper';

export const search = async ({ query }: Query) => {
	const results = await SearchEngine.search({ query: `${query} site:https://www.gocomics.com/` });
	return { id: results[0]?.url.split('/').at(-1) ?? null };
};

export const getComic = async ({ id }: Id) => await getComicData({ id });
