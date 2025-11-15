import { ExtendedRESTDataSource } from "@luferro/graphql/server";
import { formatCurrency } from "@luferro/utils/currency";
import { toDecimal } from "@luferro/utils/data";
import { toTimeUnit } from "@luferro/utils/time";

import { format } from "@luferro/utils/date";
import { SteamChartType } from "~/model/schema.generated.js";
import {
	type Payload,
	type Profile,
	type RecentlyPlayed,
	Status,
	type StoreApp,
	type Wishlist,
} from "./dtos/SteamApiDtos.js";

export class SteamDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://api.steampowered.com";
	protected readonly token: string;

	constructor({ token }: { token: string }) {
		super();
		this.token = token;
	}

	async search(query: string) {
		const $ = await this.loadUrl(
			`https://store.steampowered.com/search/suggest?term=${query}&f=games&cc=PT&realm=1&use_search_spellcheck=1`,
		);

		return $("a")
			.get()
			.map((element) => ({
				appId: Number($(element).attr("data-ds-appid")),
				title: $(element).find(".match_name").text().trim(),
				url: $(element).attr("href"),
				image: $(element).find("img").attr("src"),
				price: $(element).find(".match_price").text().trim(),
			}));
	}

	async getSteamId64(vanityUrl: string) {
		const data = await this.get<Payload<{ steamid?: string }>>("ISteamUser/ResolveVanityURL/v0001", {
			params: { vanityurl: vanityUrl, key: this.token },
		});
		return data.response?.steamid ?? null;
	}

	async getProfile(steamId: string) {
		const data = await this.get<Payload<{ players: Profile[] }>>("ISteamUser/GetPlayerSummaries/v0002", {
			params: { key: this.token, steamids: steamId },
		});

		if (data.response.players.length === 0) throw new Error(`Cannot find a profile for steamId64 ${steamId}.`);
		const { personaname, avatarfull, personastate, lastlogoff, timecreated } = data.response.players[0];

		return {
			id: steamId,
			name: personaname,
			image: avatarfull,
			status: Status[personastate],
			logoutAt: new Date(lastlogoff * 1000).getTime(),
			createdAt: new Date(timecreated * 1000).getTime(),
		};
	}

	async getRecentlyPlayed(steamId: string) {
		const data = await this.get<Payload<{ games: RecentlyPlayed[] }>>("IPlayerService/GetRecentlyPlayedGames/v0001", {
			params: { key: this.token, steamid: steamId },
		});

		return (data.response.games ?? []).map(({ appid, name, playtime_2weeks, playtime_forever }) => ({
			id: appid.toString(),
			title: name,
			totalHours: toTimeUnit({ time: playtime_forever, unit: "Minutes" }, "Hours"),
			biweeklyHours: toTimeUnit({ time: playtime_2weeks, unit: "Minutes" }, "Hours"),
			url: `https://store.steampowered.com/app/${appid}`,
		}));
	}

	async getWishlist(steamId: string) {
		const data = await this.get<Payload<{ items: Wishlist[] }>>("IWishlistService/GetWishlist/v1", {
			params: { steamid: steamId },
		});

		const appIds = data.response.items.map((game) => game.appid);
		const apps = await this.getStoreApps(appIds);
		return apps
			.map((app, index) => ({ ...app, priority: data.response.items[index].priority }))
			.sort((a, b) => {
				if (a.priority === 0 && b.priority !== 0) return 1;
				if (a.priority !== 0 && b.priority === 0) return -1;
				return a.priority - b.priority;
			});
	}

	async getPlayerCount(appId: number) {
		const data = await this.get<Payload<{ player_count: number }>>("ISteamUserStats/GetNumberOfCurrentPlayers/v1/", {
			params: { appid: appId.toString() },
		});

		return data.response.player_count;
	}

	async getStoreApps(appIds: number[], batchSize = 50) {
		const batches: number[][] = [];
		for (let i = 0; i < appIds.length; i += batchSize) {
			batches.push(appIds.slice(i, i + batchSize));
		}

		const allStoreItems: StoreApp[] = [];
		for (const batch of batches) {
			const data = await this.get<Payload<{ store_items: StoreApp[] }>>("IStoreBrowseService/GetItems/v1", {
				params: {
					input_json: encodeURIComponent(
						JSON.stringify({
							ids: batch.map((appId) => ({ appid: appId })),
							context: {
								language: "english",
								country_code: "PT",
								steam_realm: 1,
							},
							data_request: {
								include_assets: true,
								include_release: true,
								include_basic_info: true,
								include_trailers: true,
								include_screenshots: true,
							},
						}),
					),
				},
			});
			allStoreItems.push(...data.response.store_items);
		}

		return allStoreItems.map(
			({
				appid,
				name,
				release,
				assets,
				is_free,
				store_url_path,
				screenshots,
				trailers,
				basic_info,
				best_purchase_option,
			}) => {
				const getAsset = (filename: string) => assets.asset_url_format.replace("${FILENAME}", filename);

				const { short_description, developers, publishers, franchises } = basic_info;
				const { steam_release_date, coming_soon_display, custom_release_date_message, is_coming_soon } = release;
				const {
					original_price_in_cents,
					final_price_in_cents,
					discount_pct = 0,
					user_can_purchase_as_gift,
				} = best_purchase_option ?? {};

				const getCustomReleaseDateMessage = () => {
					if (!steam_release_date || !coming_soon_display) return null;

					const options: Record<typeof coming_soon_display, string | null> = {
						date_full: null,
						date_month: format(steam_release_date * 1000, "LLLL yyyy"),
						date_year: new Date(steam_release_date * 1000).getFullYear().toString(),
						text_comingsoon: custom_release_date_message ?? "Coming soon",
						text_tba: custom_release_date_message ?? "To be announced",
					};

					return options[coming_soon_display];
				};

				return {
					id: appid,
					title: name,
					url: `https://store.steampowered.com/${store_url_path}`,
					release: {
						date: steam_release_date ? new Date(steam_release_date * 1000).getTime() : null,
						customMessage: getCustomReleaseDateMessage(),
					},
					description: short_description,
					discount: discount_pct,
					regular: original_price_in_cents
						? formatCurrency(Number(toDecimal(original_price_in_cents).toFixed(2)))
						: final_price_in_cents
							? formatCurrency(Number((toDecimal(final_price_in_cents) / (1 - toDecimal(discount_pct))).toFixed(2)))
							: null,
					discounted: final_price_in_cents ? formatCurrency(Number(toDecimal(final_price_in_cents).toFixed(2))) : null,
					isFree: Boolean(is_free),
					isReleased: !is_coming_soon,
					isGiftable: user_can_purchase_as_gift,
					developers: developers?.map((developer) => developer.name) ?? [],
					publishers: publishers?.map((publisher) => publisher.name) ?? [],
					franchises: franchises?.map((franchise) => franchise.name) ?? [],
					screenshots:
						screenshots?.all_ages_screenshots?.map(
							(screenshot) => `https://shared.cloudflare.steamstatic.com/store_item_assets/${screenshot.filename}`,
						) ?? [],
					trailers:
						trailers?.highlights?.map((highlight) => {
							const getTrailer = (filename: string) => highlight.trailer_url_format.replace("${FILENAME}", filename);

							return {
								title: highlight.trailer_name,
								trailer: {
									sd: highlight.trailer_480p.map((trailer) => getTrailer(trailer.filename)),
									max: highlight.trailer_max.map((trailer) => getTrailer(trailer.filename)),
								},
							};
						}) ?? [],
					assets: {
						header: getAsset(assets.header),
						background: getAsset(assets.page_background),
						communityIcon: getAsset(assets.community_icon),
						capsule: {
							hero: getAsset(assets.hero_capsule),
							main: getAsset(assets.main_capsule),
							small: getAsset(assets.small_capsule),
						},
						library: {
							capsule: getAsset(assets.library_capsule),
							capsule2x: getAsset(assets.library_capsule_2x),
							hero: getAsset(assets.library_hero),
							hero2x: getAsset(assets.library_hero_2x),
						},
					},
				};
			},
		);
	}

	async getUpcomingSales() {
		const $ = await this.loadUrl("https://prepareyourwallet.com");

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

	async getChart(chart: SteamChartType) {
		const chartUrl: Record<typeof chart, string> = {
			[SteamChartType.TopPlayed]: "https://steamcharts.com",
			[SteamChartType.TopSellers]: "https://store.steampowered.com/search/?filter=topsellers&os=win",
			[SteamChartType.UpcomingGames]: "https://store.steampowered.com/search/?filter=popularcomingsoon&os=win",
		};
		const $ = await this.loadUrl(chartUrl[chart]);

		if (chart === SteamChartType.TopPlayed) {
			return $("table#top-games tbody tr")
				.get()
				.map((element, index) => {
					const position = index + 1;
					const name = $(element).find(".game-name a").text().trim();
					const href = $(element).find(".game-name a").attr("href");
					const url = `https://store.steampowered.com${href}`;
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
				return { position, name, url, count: null as string | null };
			})
			.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
			.slice(0, 10);
	}
}
