import { ConverterUtil, DateUtil, FetchUtil, StringUtil } from '@luferro/shared-utils';

import { Feeds, Id, Query } from '../../../types/args';
import { getDealsFeed as _getDealsFeed } from './deals.feed';

type Payload<T> = { data: T };
type Game<T> = { [key: string]: T };
type List<T> = { list: T };

type SearchResult = { results: { id: number; plain: string; title: string }[] };

type HistoricalLow = { shop?: { id: string; name: string }; price?: number; cut?: number; added?: number };

type Bundles = {
	total: number;
	list: { title: string; bundle: string; start: number; expiry: number | null; url: string }[];
};

type Prices = {
	list: {
		shop: { id: string; name: string };
		price_new: number;
		price_old: number;
		price_cut: string;
		url: string | null;
		drm: string[];
	}[];
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

const getApiKey = () => {
	if (!process.env.ITAD_API_KEY) throw new Error('ITAD_API_KEY is not set.');
	return process.env.ITAD_API_KEY;
};

export const search = async ({ query }: Query) => {
	const url = `https://api.isthereanydeal.com/v02/search/search/?key=${getApiKey()}&q=${query}&limit=20&strict=0`;
	const { payload } = await FetchUtil.fetch<Payload<SearchResult>>({ url });
	return {
		id: payload.data.results[0]?.plain ?? null,
		title: payload.data.results[0]?.title ?? null,
	};
};

const getBundles = async ({ id }: Id) => {
	const url = `https://api.isthereanydeal.com/v01/game/bundles/?key=${getApiKey()}&region=eu1&country=PT&plains=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<Game<Bundles>>>({ url });
	const { total, list } = payload.data[id];

	return {
		total,
		active: list.map(({ title, bundle, start, expiry, url }) => ({
			title,
			store: bundle,
			start: DateUtil.formatDate(start * 1000),
			expiry: expiry ? DateUtil.formatDate(expiry * 1000) : null,
			url,
		})),
	};
};

const getHistoricalLow = async ({ id }: Id) => {
	const url = `https://api.isthereanydeal.com/v01/game/lowest/?key=${getApiKey()}&region=eu1&country=PT&plains=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<Game<HistoricalLow>>>({ url });
	const { shop, price, cut, added } = payload.data[id];
	if (!shop || !price || !cut || !added) return null;

	return {
		store: shop.name,
		price: ConverterUtil.formatCurrency(price),
		discount: cut,
		date: DateUtil.formatDate(added * 1000),
	};
};

const getPrices = async ({ id }: Id) => {
	const url = `https://api.isthereanydeal.com/v01/game/lowest/?key=${getApiKey()}&region=eu1&country=PT&plains=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<Game<Prices>>>({ url });
	const { list } = payload.data[id];

	return list.map(({ shop, price_old, price_new, price_cut, drm, url }) => ({
		url,
		store: shop.name,
		regular: ConverterUtil.formatCurrency(price_old),
		discounted: ConverterUtil.formatCurrency(price_new),
		discount: price_cut,
		drm: drm.map(StringUtil.capitalize),
	}));
};

export const getDealById = async ({ id }: Id) => {
	const historicalLow = await getHistoricalLow({ id });
	const bundles = await getBundles({ id });
	const prices = await getPrices({ id });

	return { historicalLow, bundles, prices };
};

export const getFreebies = async () => {
	const url = `https://api.isthereanydeal.com/v01/deals/list/?key=${getApiKey()}&region=eu1&country=PT&limit=50`;
	const { payload } = await FetchUtil.fetch<Payload<List<Deal[]>>>({ url });

	return payload.data.list
		.filter(({ price_cut, drm }) => price_cut === 100 && drm.length > 0)
		.map(({ title, plain, price_new, price_old, price_cut, shop, drm, expiry, urls }) => ({
			title,
			id: plain,
			url: urls.buy,
			store: shop.name,
			drm: drm.every((platform) => !platform.includes('DRM Free')) ? drm.map(StringUtil.capitalize) : null,
			discount: price_cut,
			regular: ConverterUtil.formatCurrency(price_old),
			current: ConverterUtil.formatCurrency(price_new),
			expiry: expiry ? DateUtil.formatDate(expiry * 1000) : null,
		}));
};

export const getDealsFeed = async ({ feeds }: Feeds) => {
	const data = [];
	for (const url of feeds) {
		data.push(...(await _getDealsFeed({ url })));
	}
	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};
