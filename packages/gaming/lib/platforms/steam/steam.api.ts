import { Scraper } from "@luferro/scraper";
import { ConverterUtil, FetchUtil } from "@luferro/shared-utils";

import { Chart, Payload, Profile, RecentlyPlayed, Status, Wishlist } from "./steam.types";

export class SteamApi extends Scraper {
	private static BASE_API_URL = "https://api.steampowered.com";
	private static BASE_STORE_URL = "https://store.steampowered.com";

	constructor(private apiKey: string) {
		super();
	}

	async getSteamId64(id: string) {
		const { payload } = await FetchUtil.fetch<Payload<{ steamid?: string }>>(
			`${SteamApi.BASE_API_URL}/ISteamUser/ResolveVanityURL/v0001/?key=${this.apiKey}&vanityurl=${id}`,
		);
		return payload.response?.steamid ?? null;
	}

	async getProfile(id: string) {
		const { payload } = await FetchUtil.fetch<Payload<{ players: Profile[] }>>(
			`${SteamApi.BASE_API_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${id}`,
		);

		if (payload.response.players.length === 0) throw new Error(`Cannot find a profile for steamId64 ${id}.`);
		const { personaname, avatarfull, personastate, lastlogoff, timecreated } = payload.response.players[0];

		return {
			id,
			name: personaname,
			image: avatarfull,
			status: Status[personastate],
			logoutAt: new Date(lastlogoff * 1000),
			createdAt: new Date(timecreated * 1000),
		};
	}

	async getRecentlyPlayed(id: string) {
		const { payload } = await FetchUtil.fetch<Payload<{ games: RecentlyPlayed[] }>>(
			`${SteamApi.BASE_API_URL}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.apiKey}&steamid=${id}&format=json`,
		);

		return (payload.response.games ?? []).map(({ appid, name, playtime_2weeks, playtime_forever }) => ({
			id: appid.toString(),
			title: name,
			totalHours: ConverterUtil.toHours(playtime_forever * 1000 * 60),
			biweeklyHours: ConverterUtil.toHours(playtime_2weeks * 1000 * 60),
			url: `${SteamApi.BASE_STORE_URL}/app/${appid}`,
		}));
	}

	async getWishlist(id: string) {
		const wishlist = [];

		let page = 0;
		while (true) {
			const { payload } = await FetchUtil.fetch<Payload<Wishlist>>(
				`${SteamApi.BASE_STORE_URL}/wishlist/profiles/${id}/wishlistdata?p=${page}`,
			);

			const hasMore = Object.keys(payload).some((id) => !Number.isNaN(Number(id)));
			if (!hasMore) break;

			for (const [id, { name, release_date, priority, is_free_game, subs }] of Object.entries(payload)) {
				const isPriced = !is_free_game && subs.length > 0;

				const discount = isPriced ? subs[0].discount_pct : null;
				const originalPriceBlock = isPriced
					? this.static.loadHtml(subs[0].discount_block)(".discount_original_price")
					: null;
				const regular = isPriced
					? Number(originalPriceBlock?.text().replace(/[^\d-]/g, "") || subs[0].price) / 100
					: null;

				wishlist.push({
					id,
					priority,
					regular,
					discount,
					discounted: isPriced && discount ? subs[0].price / 100 : null,
					title: name,
					url: `${SteamApi.BASE_STORE_URL}/app/${id}`,
					isFree: is_free_game,
					isReleased: typeof release_date === "string",
					onSale: Boolean(discount),
				});
			}
			page++;
		}

		return wishlist.sort(
			(a, b) => (a.priority !== 0 ? a.priority : Infinity) - (b.priority !== 0 ? b.priority : Infinity),
		);
	}

	async getUpcomingSales() {
		const $ = await this.static.loadUrl("https://prepareyourwallet.com");

		const sale = $("p").first().attr("content") ?? null;
		const status = $("span.status").first().text();
		const upcoming = $(".row")
			.first()
			.children("div")
			.get()
			.map((element) => {
				const name = $(element).find("span").first().text();
				const date = $(element).find("p").first().text().trim();
				const fixedDate = date?.replace(/Confirmed|Not confirmed/, "").trim() ?? "";
				return `> __${name}__ ${fixedDate}`;
			});

		return { sale, status, upcoming };
	}

	async getChart(chart: Chart) {
		const chartUrl: Record<typeof chart, string> = {
			[Chart.TOP_PLAYED]: "https://steamcharts.com",
			[Chart.TOP_SELLERS]: `${SteamApi.BASE_STORE_URL}/search/?filter=topsellers&os=win`,
			[Chart.UPCOMING_GAMES]: `${SteamApi.BASE_STORE_URL}/search/?filter=popularcomingsoon&os=win`,
		};
		const $ = await this.static.loadUrl(chartUrl[chart]);

		if (chart === Chart.TOP_PLAYED) {
			return $("table#top-games tbody tr")
				.get()
				.map((element, index) => {
					const position = index + 1;
					const name = $(element).find(".game-name a").text().trim();
					const href = $(element).find(".game-name a").attr("href");
					const url = `${SteamApi.BASE_STORE_URL}${href}`;
					const count = $(element).find(".num").first().text();

					return { position, name, url, count };
				});
		}

		return $(".search_result_row")
			.get()
			.map((element, index) => {
				const position = index + 1;
				const name = $(element).find(".responsive_search_name_combined .title").first().text();
				const url = $(element).first().attr("href")!;
				return { position, name, url, count: null };
			})
			.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
			.slice(0, 10);
	}
}
