import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getDealDetails, getFirstSearchResult, getLatestBlogPost, getLatestDeals } from './deals.scraper';

export const search = async (title: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.SEARCH, title);
	return await getFirstSearchResult(url);
};

export const getDealById = async (id: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAME_PAGE, id);
	const { name, image, stores, coupons, historicalLows } = await getDealDetails(url);

	const formattedStores = stores.map(({ isOfficialStore, name, url, coupon, price }) => ({
		isOfficialStore,
		text: `> **[${name}](${url})** ${coupon.position ? `*(${coupon.position})*` : ''} - \`${price}\``,
	}));
	const officialStores = formattedStores.filter((store) => store.isOfficialStore).map(({ text }) => text);
	const keyshops = formattedStores.filter((store) => !store.isOfficialStore).map(({ text }) => text);

	return {
		name,
		image,
		historicalLows,
		officialStores,
		keyshops,
		coupons: coupons.map((text, index) => `> *(${index + 1}) ${text}*`),
	};
};

export const getLatestPaidDeals = async () => await getLatestDeals(Endpoint.LATEST_PAID_DEALS);

export const getLatestFreeDeals = async () => await getLatestDeals(Endpoint.LATEST_FREE_DEALS);

export const getLatestSale = async () => await getLatestBlogPost(Endpoint.LATEST_SALES);

export const getLatestBundle = async () => await getLatestBlogPost(Endpoint.LATEST_BUNDLES);

export const getLatestPrimeGamingAddition = async () => await getLatestBlogPost(Endpoint.LATEST_PRIME_GAMING);
