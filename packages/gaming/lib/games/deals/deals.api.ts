import { FetchUtil } from "@luferro/shared-utils";

import { Bundle, Deal, Game, HistoricalLow, List, Result } from "./deals.types";

export class DealsApi {
	private static BASE_API_URL = "https://api.isthereanydeal.com";

	constructor(private apiKey: string) {}

	private async getActiveBundles(id: string, { country = "PT" } = {}) {
		const { payload } = await FetchUtil.fetch<Bundle[]>(
			`${DealsApi.BASE_API_URL}/games/bundles/v2?key=${this.apiKey}&id=${id}&country=${country}`,
		);

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

	private async getHistoricalLow(id: string, { country = "PT" } = {}) {
		const { payload } = await FetchUtil.fetch<(Pick<Game, "id"> & { low: HistoricalLow })[]>(
			`${DealsApi.BASE_API_URL}/games/historylow/v1?key=${this.apiKey}&country=${country}`,
			{ method: "POST", body: JSON.stringify([id]) },
		);
		const historicalLows = payload[0].low ?? {};
		const { shop, regular, cut, price, timestamp } = historicalLows;

		return {
			regular,
			store: shop.name,
			discount: cut,
			discounted: price,
			timestamp: timestamp ? new Date(timestamp).getTime() : null,
		};
	}

	private async getPrices(id: string, { country = "PT" } = {}) {
		const { payload } = await FetchUtil.fetch<(Pick<Game, "id"> & { deals: Deal[] })[]>(
			`${DealsApi.BASE_API_URL}/games/prices/v2?key=${this.apiKey}&country=${country}`,
			{ method: "POST", body: JSON.stringify([id]) },
		);
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

	async search(query: string) {
		const { payload } = await FetchUtil.fetch<Result>(
			`${DealsApi.BASE_API_URL}/games/search/v1?key=${this.apiKey}&title=${query}`,
		);
		return payload.map(({ id, title }) => ({ id, title }));
	}

	async getDealsById(id: string, { country = "PT" } = {}) {
		const historicalLow = await this.getHistoricalLow(id, { country });
		const bundles = await this.getActiveBundles(id, { country });
		const prices = await this.getPrices(id, { country });

		return { id, prices, historicalLow, bundles };
	}

	async getFreebies({ country = "PT" } = {}) {
		const filter = "N4IgDgTglgxgpiAXKAtlAdkgDAGhCgQwA9sBfPGAVwBclUMkBGLXfYpl8kAEwhSQDajAGw4AzAFYcEgEw5hjeTIC6pIA";
		const { payload } = await FetchUtil.fetch<List<(Omit<Game, "mature"> & { deal: Deal })[]>>(
			`${DealsApi.BASE_API_URL}/deals/v2?key=${this.apiKey}&country=${country}&filter=${encodeURI(filter)}&sort:-time`,
		);

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
