import { StaticScraper } from '@luferro/scraper';
import { ConverterUtil } from '@luferro/shared-utils';

import { Id } from '../../../types/args';

type Payload<T> = { props: { pageProps: { game: { data: { game: T } } } } };
type Entry = { game_name: string; game_image: string; comp_main: number; comp_plus: number; comp_100: number };

export const getPlaytimeData = async ({ id }: Id) => {
	const $ = await StaticScraper.loadUrl({ url: `https://howlongtobeat.com/game/${id}` });

	const script = $('script[type="application/json"]').text();
	const { props } = JSON.parse(script) as Payload<Entry[]>;
	const [{ game_name, game_image, comp_main, comp_plus, comp_100 }] = props.pageProps.game.data.game;

	return {
		name: game_name,
		image: game_image ? `https://howlongtobeat.com/games/${game_image}` : null,
		playtimes: {
			main: comp_main != 0 ? `${ConverterUtil.toHours(comp_main * 1000)}h` : null,
			mainExtra: comp_plus != 0 ? `${ConverterUtil.toHours(comp_plus * 1000)}h` : null,
			completionist: comp_100 != 0 ? `${ConverterUtil.toHours(comp_100 * 1000)}h` : null,
		},
	};
};
