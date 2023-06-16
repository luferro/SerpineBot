import { ConverterUtil, DateUtil, FetchUtil } from '@luferro/shared-utils';

type Payload<T> = { data: T };
type Game<T> = { [key: string]: T };
type List<T> = { list: T };

type Search = { results: { id: number; plain: string; title: string }[]; urls: { search: string } };

type Price = { store: string; cut: number; price: number; price_formatted: string; url: string | null };
type Overview = {
	price: Price;
	lowest: Price & { recorded: string; recorded_formatted: string };
	bundles: {
		count: number;
		live: {
			title: string;
			url: string;
			expiry: number;
			page: string;
			details: string;
			tiers: { price: string; price_formatted: string; note: string; games: string[] }[];
		}[];
	};
	urls: { info: string; history: string; bundles: string };
};

type Deal = {
	plain: string;
	title: string;
	price_new: number;
	price_old: number;
	price_cut: number;
	added: number;
	expiry: number;
	drm: string[];
	shop: { id: string; name: string };
	urls: { buy: string; game: string };
};

export const auth = {
	apiKey: null as string | null,
	setApiKey: function (API_KEY: string) {
		this.apiKey = API_KEY;
	},
	validate: function () {
		if (!this.apiKey) throw new Error('ITAD API key is not set.');
	},
};

export const search = async (query: string) => {
	const url = `https://api.isthereanydeal.com/v02/search/search/?key=${auth.apiKey}&q=${query}&limit=20&strict=0`;
	const { payload } = await FetchUtil.fetch<Payload<Search>>({ url });
	return {
		id: payload.data.results[0]?.plain ?? null,
		title: payload.data.results[0]?.title ?? null,
	};
};

export const getDealById = async (id: string) => {
	const url = `https://api.isthereanydeal.com/v01/game/overview/?key=${auth.apiKey}&region=eu1&country=PT&plains=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<Game<Overview>>>({ url });
	if (!payload.data[id].price && !payload.data[id].lowest) throw new Error(`No deal was found for ${id}.`);

	const { price, lowest, bundles, urls } = payload.data[id];

	return {
		url: urls.info,
		deal: {
			price: price.price_formatted,
			store: price.store,
			url: price.url,
		},
		historicalLow: {
			price: lowest?.price_formatted,
			store: lowest?.store,
			url: lowest?.url,
			on: lowest.recorded_formatted,
		},
		bundles: {
			count: bundles.count,
			live: bundles.live.map(({ title, url, page, expiry, tiers }) => ({
				title,
				url,
				store: page,
				expiry: DateUtil.formatDate(expiry * 1000),
				tiers: tiers.map(({ price_formatted, games }) => ({ price: price_formatted, games })),
			})),
		},
	};
};

export const getLatestDeals = async () => {
	const url = `https://api.isthereanydeal.com/v01/deals/list/?key=${auth.apiKey}&region=eu1&country=PT&limit=50`;
	const { payload } = await FetchUtil.fetch<Payload<List<Deal[]>>>({ url });

	return payload.data.list
		.filter(({ drm }) => drm.length > 0)
		.map(({ title, price_new, price_old, price_cut, shop, expiry, urls }) => ({
			title,
			url: urls.buy,
			store: shop.name,
			isFree: price_cut === 100,
			discount: price_cut,
			regular: ConverterUtil.formatCurrency(price_old),
			current: ConverterUtil.formatCurrency(price_new),
			expiry: expiry ? DateUtil.formatDate(expiry * 1000) : null,
		}));
};
