import { Scraper } from "@luferro/scraper";
import { ConverterUtil, FetchUtil } from "@luferro/shared-utils";

import { Payload, Playtime, Result } from "./hltb.types";

export class HLTBApi extends Scraper {
	private static BASE_URL = "https://howlongtobeat.com";

	private getHeaders() {
		return new Map([
			["origin", "https://howlongtobeat.com"],
			["referer", "https://howlongtobeat.com"],
		]);
	}

	async search(query: string) {
		const data = await FetchUtil.fetch<Result>(`${HLTBApi.BASE_URL}/api/search`, {
			method: "POST",
			headers: this.getHeaders(),
			body: JSON.stringify({
				searchType: "games",
				searchTerms: [query],
				searchPage: 1,
				size: 20,
				searchOptions: {
					games: {
						userId: 0,
						platform: "",
						sortCategory: "popular",
						rangeCategory: "main",
						rangeYear: { min: "", max: "" },
						rangeTime: { min: null, max: null },
						gameplay: { perspective: "", flow: "", genre: "" },
						modifier: "",
					},
					lists: { sortCategory: "follows" },
					users: { sortCategory: "postcount" },
					filter: "",
					sort: 0,
					randomizer: 0,
				},
			}),
		});

		return data.payload.data.map((result) => ({ id: result.game_id, title: result.game_name }));
	}

	async getPlaytimesById(id: string) {
		const $ = await this.static.loadUrl(`${HLTBApi.BASE_URL}/game/${id}`);

		const script = $('script[type="application/json"]').text();
		const { props } = JSON.parse(script) as Payload<Playtime[]>;
		const [{ game_name, game_image, comp_main, comp_plus, comp_100 }] = props.pageProps.game.data.game;

		return {
			id,
			title: game_name,
			url: `https://howlongtobeat.com/game/${id}`,
			image: game_image ? `${HLTBApi.BASE_URL}/games/${game_image}` : null,
			playtimes: {
				main: comp_main !== 0 ? `${ConverterUtil.toHours(comp_main * 1000)}h` : null,
				mainExtra: comp_plus !== 0 ? `${ConverterUtil.toHours(comp_plus * 1000)}h` : null,
				completionist: comp_100 !== 0 ? `${ConverterUtil.toHours(comp_100 * 1000)}h` : null,
			},
		};
	}
}
