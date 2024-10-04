import { toTimeUnit } from "@luferro/helpers/datetime";
import { fetcher } from "@luferro/helpers/fetch";
import { Scraper } from "@luferro/scraper";
import type { Payload, Playtime, Result } from "./hltb.types.js";

export class HLTBApi {
	private static BASE_URL = "https://howlongtobeat.com";

	private scraper: Scraper;
	private hash: string | null = null;
	private payload: Record<string, unknown> = {
		searchType: "games",
		searchPage: 1,
		size: 20,
		searchOptions: {
			games: {
				userId: 0,
				platform: "",
				sortCategory: "popular",
				rangeCategory: "main",
				rangeTime: { min: null, max: null },
				gameplay: { perspective: "", flow: "", genre: "" },
				rangeYear: { min: "", max: "" },
				modifier: "",
			},
			users: { sortCategory: "postcount" },
			lists: { sortCategory: "follows" },
			filter: "",
			sort: 0,
			randomizer: 0,
		},
		useCache: true,
	};

	constructor() {
		this.scraper = new Scraper();
	}

	private getHeaders() {
		return new Map([
			["origin", HLTBApi.BASE_URL],
			["referer", HLTBApi.BASE_URL],
			["authority", "howlongtobeat.com"],
		]);
	}

	private async getLatestScriptTag() {
		const $ = await this.scraper.static.loadUrl(HLTBApi.BASE_URL);
		const latestScriptTag = $('script[src*="_app"]').first();
		return latestScriptTag?.attr("src");
	}

	private async updateHash() {
		const file = await this.getLatestScriptTag();
		if (!file) throw new Error("Could not retrieve script tag.");

		const $ = await this.scraper.static.loadUrl(HLTBApi.BASE_URL.concat(file));
		const hashMatch = /concat\("([a-zA-Z0-9]+)"\)/.exec($.html());
		const hash = hashMatch?.[1];
		if (!hash) throw new Error("Could not retrieve hash.");
		this.hash = hash;
	}

	async search(query: string): Promise<{ id: string; title: string; releaseYear: number }[]> {
		if (!this.hash) await this.updateHash();

		try {
			const data = await fetcher<Result>(`${HLTBApi.BASE_URL}/api/search/${this.hash}`, {
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify({ ...this.payload, searchTerms: query.split(" ") }),
			});
			return data.payload.data.map((result) => ({
				id: result.game_id.toString(),
				title: result.game_name,
				releaseYear: result.release_world,
			}));
		} catch (error) {
			await this.updateHash();
			return await this.search(query);
		}
	}

	async getPlaytimesById(id: string) {
		const $ = await this.scraper.static.loadUrl(`${HLTBApi.BASE_URL}/game/${id}`);

		const script = $('script[type="application/json"]').text();
		const { props } = JSON.parse(script) as Payload<Playtime[]>;
		const [{ game_name, game_image, comp_main, comp_plus, comp_100 }] = props.pageProps.game.data.game;

		return {
			id,
			title: game_name,
			url: `${HLTBApi.BASE_URL}/game/${id}`,
			image: game_image ? `${HLTBApi.BASE_URL}/games/${game_image}` : null,
			playtimes: {
				main: comp_main !== 0 ? `${toTimeUnit({ time: comp_main, unit: "Seconds" }, "Hours")}h` : null,
				mainExtra: comp_plus !== 0 ? `${toTimeUnit({ time: comp_plus, unit: "Seconds" }, "Hours")}h` : null,
				completionist: comp_100 !== 0 ? `${toTimeUnit({ time: comp_100, unit: "Seconds" }, "Hours")}h` : null,
			},
		};
	}
}
