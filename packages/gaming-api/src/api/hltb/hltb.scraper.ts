import { StaticScraper } from '@luferro/scraper';
import { ConverterUtil } from '@luferro/shared-utils';

type Payload<T> = { props: { pageProps: { game: { data: { game: T } } } } };

type Entry = {
	game_id: number;
	game_name: string;
	game_alias: string;
	profile_summary: string;
	profile_dev: string;
	profile_pub: string;
	profile_genre: string;
	release_world: string;
	review_score: number;
	profile_steam: number;
	profile_ign: string;
	rating_esrb: string;
	game_image: string;
	comp_main: number;
	comp_plus: number;
	comp_100: number;
};

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
	} = JSON.parse(script) as Payload<Entry[]>;

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
