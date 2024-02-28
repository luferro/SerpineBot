import { FetchUtil } from "@luferro/shared-utils";

import { ApiKey, Id, Query } from "../../types/args";
import { Bundle, Deal, Game, HistoricalLow, List, Result } from "./deals.types";

export class DealsApi {
	private static BASE_API_URL = "https://api.isthereanydeal.com";

	private apiKey: string;

	constructor({ apiKey }: ApiKey) {
		this.apiKey = apiKey;
	}

	private async getActiveBundles({ id }: Id) {
		const { payload } = await FetchUtil.fetch<Bundle[]>({
			url: `${DealsApi.BASE_API_URL}/games/bundles/v2?key=${this.apiKey}&id=${id}&country=PT`,
		});

		return payload.map(({ id, title, url, page, tiers, expiry, publish }) => ({
			id,
			title,
			url,
			store: page.name,
			tiers: tiers.map((tier) => ({
				price: tier.price,
				games: tier.games.map((game) => ({ id: game.id, title: game.title })),
			})),
			expiry: expiry ? new Date(expiry).getTime() : null,
			timestamp: publish ? new Date(publish).getTime() : null,
		}));
	}

	private async getHistoricalLow({ id }: Id) {
		const url = `${DealsApi.BASE_API_URL}/games/historylow/v1?key=${this.apiKey}&country=PT`;
		const { payload } = await FetchUtil.fetch<(Pick<Game, "id"> & { low: HistoricalLow })[]>({
			url,
			method: "POST",
			body: JSON.stringify([id]),
		});
		const historicalLows = payload[0].low ?? {};
		const { shop, regular, cut, price, timestamp } = historicalLows;

		return {
			url,
			regular,
			store: shop.name,
			discount: cut,
			discounted: price,
			timestamp: timestamp ? new Date(timestamp).getTime() : null,
		};
	}

	private async getPrices({ id }: Id) {
		const url = `${DealsApi.BASE_API_URL}/games/prices/v2?key=${this.apiKey}&country=PT`;
		const { payload } = await FetchUtil.fetch<(Pick<Game, "id"> & { deals: Deal[] })[]>({
			url,
			method: "POST",
			body: JSON.stringify([id]),
		});
		const deals = payload[0]?.deals ?? [];

		return deals.map(({ url, shop, drm, platforms, voucher, regular, cut, price, expiry, timestamp }) => ({
			url,
			voucher,
			regular,
			store: shop.name,
			drm: drm.map((drm) => drm.name),
			platforms: platforms.map((platform) => platform.name),
			discount: cut,
			discounted: price,
			expiry: expiry ? new Date(expiry).getTime() : null,
			timestamp: timestamp ? new Date(timestamp).getTime() : null,
		}));
	}

	async search({ query }: Query) {
		const { payload } = await FetchUtil.fetch<Result>({
			url: `${DealsApi.BASE_API_URL}/games/search/v1?key=${this.apiKey}&title=${query}`,
		});
		return payload.map(({ id, title }) => ({ id, title }));
	}

	async getDealsById({ id }: Id) {
		const historicalLow = await this.getHistoricalLow({ id });
		const bundles = await this.getActiveBundles({ id });
		const prices = await this.getPrices({ id });

		return { id, prices, historicalLow, bundles };
	}

	async getFreebies() {
		const filter = "N4IgDgTglgxgpiAXKAtlAdkgDAGhCgQwA9sBfPGAVwBclUMkBGLXfYpl8kAEwhSQDajAGw4AzAFYcEgEw5hjeTIC6pIA";
		const { payload } = await FetchUtil.fetch<List<(Omit<Game, "mature"> & { deal: Deal })[]>>({
			url: `${DealsApi.BASE_API_URL}/deals/v2?key=${this.apiKey}&country=PT&filter=${encodeURI(filter)}&sort:-time`,
		});

		return payload.list.map(({ id, title, deal }) => ({
			id,
			title,
			url: deal.url,
			store: deal.shop.name,
			drm: deal.drm.map((drm) => drm.name),
			platforms: deal.platforms.map((platform) => platform.name),
			voucher: deal.voucher,
			regular: deal.regular,
			discount: deal.cut,
			discounted: deal.price,
			expiry: deal.expiry ? new Date(deal.expiry).getTime() : null,
			timestamp: deal.timestamp ? new Date(deal.timestamp).getTime() : null,
		}));
	}
}
