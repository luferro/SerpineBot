import { StaticScraper } from '@luferro/scraper';
import { ConverterUtil } from '@luferro/shared-utils';

import { HowLongToBeatResponse } from '../../types/payload';

export enum Endpoint {
	GAME_PAGE = 'https://howlongtobeat.com/game/:id',
}

export const getGameDetails = async (url: Endpoint) => {
	const $ = await StaticScraper.load(url);

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
			main: comp_main != 0 ? ConverterUtil.toHoursFormatted(comp_main * 1000) : null,
			mainExtra: comp_plus != 0 ? ConverterUtil.toHoursFormatted(comp_plus * 1000) : null,
			completionist: comp_100 != 0 ? ConverterUtil.toHoursFormatted(comp_100 * 1000) : null,
		},
	};
};
