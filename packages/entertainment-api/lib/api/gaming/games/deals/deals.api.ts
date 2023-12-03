import { ConverterUtil, DateUtil, FetchUtil, StringUtil } from '@luferro/shared-utils';

import { ApiKey, Id, Query } from '../../../../types/args';
import { Bundles, Deal, Game, HistoricalLow, List, Payload, Price, Result } from './deals.types';

export class DealsApi {
	private static BASE_API_URL = 'https://api.isthereanydeal.com';

	private apiKey: string;

	constructor({ apiKey }: ApiKey) {
		this.apiKey = apiKey;
	}

	private async getBundles({ id }: Id) {
		const { payload } = await FetchUtil.fetch<Payload<Game<Bundles>>>({
			url: `${DealsApi.BASE_API_URL}/v01/game/bundles/?key=${this.apiKey}&region=eu1&country=PT&plains=${id}`,
		});
		const { total, list } = payload.data[id];

		return {
			total,
			active: list.map(({ title, bundle, start, expiry, url }) => ({
				title,
				store: bundle,
				start: DateUtil.format(start * 1000),
				expiry: expiry ? DateUtil.format(expiry * 1000) : null,
				url,
			})),
		};
	}

	private async getHistoricalLow({ id }: Id) {
		const { payload } = await FetchUtil.fetch<Payload<Game<HistoricalLow>>>({
			url: `${DealsApi.BASE_API_URL}/v01/game/lowest/?key=${this.apiKey}&region=eu1&country=PT&plains=${id}`,
		});
		const { shop, price, cut, added } = payload.data[id];
		if (!shop || !price || !cut || !added) return null;

		return {
			store: shop.name,
			price: ConverterUtil.formatCurrency(price),
			discount: cut,
			date: DateUtil.formatDistance(added * 1000),
		};
	}

	private async getPrices({ id }: Id) {
		const url = `${DealsApi.BASE_API_URL}/v01/game/prices/?key=${this.apiKey}&region=eu1&country=PT&plains=${id}`;
		const { payload } = await FetchUtil.fetch<Payload<Game<List<Price[]>>>>({ url });
		const { list } = payload.data[id];

		return list.map(({ shop, price_old, price_new, price_cut, drm, url }) => ({
			url,
			store: shop.name,
			regular: ConverterUtil.formatCurrency(price_old),
			discounted: ConverterUtil.formatCurrency(price_new),
			discount: price_cut,
			drm: drm.map(StringUtil.capitalize),
		}));
	}

	async search({ query }: Query) {
		const { payload } = await FetchUtil.fetch<Payload<Result>>({
			url: `${DealsApi.BASE_API_URL}/v02/search/search/?key=${this.apiKey}&q=${query}&limit=20&strict=0`,
		});
		return payload.data.results.map(({ plain, title }) => ({ title, id: plain }));
	}

	async getDealById({ id }: Id) {
		const historicalLow = await this.getHistoricalLow({ id });
		const bundles = await this.getBundles({ id });
		const prices = await this.getPrices({ id });

		return { historicalLow, bundles, prices };
	}

	async getFreebies() {
		const { payload } = await FetchUtil.fetch<Payload<List<Deal[]>>>({
			url: `${DealsApi.BASE_API_URL}/v01/deals/list/?key=${this.apiKey}&region=eu1&country=PT&limit=50`,
		});

		return payload.data.list
			.filter(({ price_cut, drm }) => price_cut === 100 && drm.length > 0)
			.map(({ title, plain, price_new, price_old, price_cut, shop, drm, expiry, added, urls }) => ({
				title,
				id: plain,
				url: urls.buy,
				store: shop.name,
				drm: drm.every((platform) => !platform.includes('DRM Free')) ? drm.map(StringUtil.capitalize) : null,
				discount: price_cut,
				regular: ConverterUtil.formatCurrency(price_old),
				current: ConverterUtil.formatCurrency(price_new),
				expiry: expiry ? DateUtil.format(expiry * 1000) : null,
				added: added ? DateUtil.format(added * 1000) : null,
			}));
	}
}
