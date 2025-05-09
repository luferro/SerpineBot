import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import { toTimeUnit } from "@luferro/utils/time";
import { cache } from "~/cache.js";

import type { Payload, Playtime, Result } from "./dtos/HltbApiDtos.js";

export class HltbDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://howlongtobeat.com";

	private getCacheKey() {
		return "hltb-hash";
	}

	private async getLatestScriptTag() {
		const $ = await this.loadUrl("/");
		const latestScriptTag = $('script[src*="_app"]').first();
		return latestScriptTag?.attr("src");
	}

	private async updateHash() {
		const file = await this.getLatestScriptTag();
		if (!file) throw new Error("Could not retrieve script tag.");

		const $ = await this.loadUrl(file);
		const hash = Array.from($.html().matchAll(/concat\("([a-zA-Z0-9]+)"\)/g), (matches) => matches[1]).join("");
		if (!hash) throw new Error("Could not retrieve hash.");
		await cache.set(this.getCacheKey(), hash);
	}

	protected async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		request.headers = this.getHeaders();
		request.headers.origin = this.baseURL;
		request.headers.referer = this.baseURL;
		request.headers.authority = "howlongtobeat.com";
	}

	protected async onNotFound() {
		await this.updateHash();
	}

	async search(query: string) {
		const hash = await cache.getOrRefresh<string>(this.getCacheKey(), this.onNotFound.bind(this));
		if (!hash) throw new Error("Cannot retrieve hltb hash.");

		const results = await this.post<Result>(`api/search/${hash}`, {
			body: {
				searchType: "games",
				searchPage: 1,
				size: 20,
				searchTerms: query.split(" "),
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
			},
		});
		return results.data.map((result) => ({
			id: result.game_id.toString(),
			title: result.game_name,
			releaseYear: result.release_world,
		}));
	}

	async getPlaytimesById(id: string) {
		const $ = await this.loadUrl(`game/${id}`);

		const script = $('script[type="application/json"]').text();
		const { props } = JSON.parse(script) as Payload<Playtime[]>;
		const [{ game_name, game_image, comp_main, comp_plus, comp_100 }] = props.pageProps.game.data.game;

		return {
			id,
			title: game_name,
			url: `${this.baseURL}/game/${id}`,
			image: game_image ? `${this.baseURL}/games/${game_image}` : null,
			main: comp_main !== 0 ? `${toTimeUnit({ time: comp_main, unit: "Seconds" }, "Hours")}h` : null,
			mainExtra: comp_plus !== 0 ? `${toTimeUnit({ time: comp_plus, unit: "Seconds" }, "Hours")}h` : null,
			completionist: comp_100 !== 0 ? `${toTimeUnit({ time: comp_100, unit: "Seconds" }, "Hours")}h` : null,
		};
	}
}
