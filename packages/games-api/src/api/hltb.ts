import { FetchUtil, ConverterUtil } from '@luferro/shared-utils';
import { GoogleSearchApi } from '@luferro/google-api';
import { load } from 'cheerio';
import type { HowLongToBeatResponse } from '../types/response';

export const search = async (title: string) => {
	const results = await GoogleSearchApi.search(`${title} site:https://howlongtobeat.com`);
	if (results.length === 0) throw new Error(`No results were found for ${title}`);

	const {
		0: { url },
	} = results;
	const params = new URL(url).searchParams;
	const id = params.get('id') ?? url.split('/').at(-1);

	return { id };
};

export const getGameById = async (id: string) => {
	const data = await FetchUtil.fetch<string>({ url: `https://howlongtobeat.com/game/${id}` });
	const $ = load(data);

	const script = $('script[type="application/json"]').text();
	const {
		props: {
			pageProps: {
				game: {
					data: {
						game: {
							0: { game_name, game_image, comp_main, comp_plus, comp_100 },
						},
					},
				},
			},
		},
	} = JSON.parse(script) as HowLongToBeatResponse;

	return {
		name: game_name,
		image: game_image ? `https://howlongtobeat.com/games/${game_image}` : null,
		playtimes: {
			main: comp_main != 0 ? (ConverterUtil.toHours(comp_main * 1000, true) as string) : null,
			mainExtra: comp_plus != 0 ? (ConverterUtil.toHours(comp_plus * 1000, true) as string) : null,
			completionist: comp_100 != 0 ? (ConverterUtil.toHours(comp_100 * 1000, true) as string) : null,
		},
	};
};
