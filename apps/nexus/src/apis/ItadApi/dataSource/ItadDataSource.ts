import { RESTDataSource } from "@luferro/graphql/server";
import type { ItadDealInput } from "~/model/schema.generated.js";

import type { Bundle, DealsList, GamePrice, Info, Result } from "./dtos/ItadApiDtos.js";

export class ItadDataSource extends RESTDataSource {
	override readonly baseURL = "https://api.isthereanydeal.com";
	readonly token: string;

	constructor({ token }: { token: string }) {
		super();
		this.token = token;
	}

	async search(query: string) {
		const data = await this.get<Result>("games/search/v1", {
			params: {
				title: query,
				key: this.token,
			},
		});
		return data.map(({ id, title }) => ({ id, title }));
	}

	async getDealsById({ id, country = "PT" }: ItadDealInput) {
		const info = await this.get<Info>("games/info/v2", {
			params: {
				id,
				key: this.token,
			},
		});

		const prices = await this.post<GamePrice[]>("games/prices/v3", {
			params: {
				country,
				vouchers: "true",
				key: this.token,
			},
			body: JSON.stringify([id]),
		});
		const historyLow = prices.length > 0 ? prices[0].historyLow : {};
		const deals = prices.length > 0 ? prices[0].deals : [];

		const bundles = await this.get<Bundle[]>("games/bundles/v2", {
			params: {
				id,
				country,
				expired: "true",
				key: this.token,
			},
		});

		return {
			id,
			appId: info.appid,
			slug: info.slug,
			title: info.title,
			image: info.assets.boxart ?? null,
			releaseDate: info.releaseDate,
			reviews: info.reviews,
			playerCount: info.players,
			isEarlyAccess: info.earlyAccess,
			hasAchievements: info.achievements,
			hasTradingCards: info.tradingCards,
			historicalLow: historyLow,
			deals: deals.map((deal) => ({
				url: deal.url,
				voucher: deal.voucher,
				store: deal.shop.name,
				regular: deal.regular,
				discounted: deal.price,
				discount: deal.cut,
				drm: deal.drm.map((drm) => drm.name),
				platforms: deal.platforms.map((platform) => platform.name),
				storeHistoricalLow: deal.storeLow,
				timestamp: new Date(deal.timestamp).getTime(),
				expiry: deal.expiry ? new Date(deal.expiry).getTime() : null,
			})),
			bundles: bundles.map((bundle) => ({
				id: bundle.id,
				title: bundle.title,
				url: bundle.url,
				store: bundle.page.name,
				tiers: bundle.tiers,
				timestamp: new Date(bundle.publish).getTime(),
				expiry: bundle.expiry ? new Date(bundle.expiry).getTime() : null,
			})),
		};
	}

	async getFreebies(country = "PT") {
		const data = await this.get<DealsList>("deals/v2", {
			params: {
				country,
				filter: encodeURI(
					"N4IgDgTglgxgpiAXKAtlAdkgDAGhCgQwA9sBfPGAVwBclUMkBGLXfYpl8kAEwhSQDajAGw4AzAFYcEgEw5hjeTIC6pIA",
				),
				key: this.token,
			},
		});

		return data.list.map(({ id, slug, title, type, deal }) => ({
			id,
			slug,
			title,
			type,
			url: deal.url,
			voucher: deal.voucher,
			store: deal.shop.name,
			regular: deal.regular,
			discounted: deal.price,
			discount: deal.cut,
			drm: deal.drm.map((drm) => drm.name),
			platforms: deal.platforms.map((platform) => platform.name),
			timestamp: new Date(deal.timestamp).getTime(),
			expiry: deal.expiry ? new Date(deal.expiry).getTime() : null,
		}));
	}
}
