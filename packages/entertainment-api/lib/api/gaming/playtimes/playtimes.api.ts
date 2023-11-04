import { FetchUtil } from '@luferro/shared-utils';

import { Id, Query } from '../../../types/args';
import { getPlaytimeData } from './playtimes.scraper';

type SearchResult = { data: { game_id: string; game_name: string }[] };

export const search = async ({ query }: Query) => {
	const data = await FetchUtil.fetch<SearchResult>({
		method: 'POST',
		url: 'https://howlongtobeat.com/api/search',
		customHeaders: new Map([
			['origin', 'https://howlongtobeat.com'],
			['referer', 'https://howlongtobeat.com'],
		]),
		body: JSON.stringify({
			searchType: 'games',
			searchTerms: [query],
			searchPage: 1,
			size: 20,
			searchOptions: {
				games: {
					userId: 0,
					platform: '',
					sortCategory: 'popular',
					rangeCategory: 'main',
					rangeYear: { min: '', max: '' },
					rangeTime: { min: null, max: null },
					gameplay: { perspective: '', flow: '', genre: '' },
					modifier: '',
				},
				lists: { sortCategory: 'follows' },
				users: { sortCategory: 'postcount' },
				filter: '',
				sort: 0,
				randomizer: 0,
			},
		}),
	});

	return data.payload.data.map((result) => ({ id: result.game_id, title: result.game_name }));
};

export const getPlaytimesByGameId = async ({ id }: Id) => await getPlaytimeData({ id });
