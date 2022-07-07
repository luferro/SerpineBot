import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import { BlogCategories, DealCategories } from '../types/categories';
import * as UrlUtil from '../utils/url';

export const search = async (title: string) => {
	const data = await fetch<string>({ url: `https://gg.deals/eu/games/?view=list&title=${title}` });
	const $ = load(data);

	const href = $('#games-list .game-list-item a').first().attr('href');

	return href?.match(/\/game\/(.*)\//)?.pop();
};

export const getDealById = async (id: string) => {
	const data = await fetch<string>({ url: `https://gg.deals/eu/game/${id}` });
	const $ = load(data);

	const name = $('.image-game').first().attr('alt')!;
	const image = $('.image-game').first().attr('src')?.replace('307xt176', '616xt353');
	const isValidScheme = /^(http|https)/g.test(image ?? '');

	const historicalLows = $('#game-lowest-tab-price .game-lowest-price-row')
		.get()
		.map((element) => {
			const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
			const price = $(element).find('.game-lowest-price-inner-row .price span').first().text();
			const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
			const activeStatus = $(element).find('.game-lowest-price-details-row .active').first().text().trim();
			const expireStatus = $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();
			const status = activeStatus || expireStatus;

			return `> __${tag}__ \`${price}\` @ ${store} - ${status}`;
		});

	const couponsArray: string[] = [];
	const getCouponPosition = (couponText: string) => {
		if (!couponText) return;

		const isStored = couponsArray.includes(couponText);
		if (!isStored) couponsArray.push(couponText);

		const couponIndex = couponsArray.findIndex((storedCouponText) => storedCouponText === couponText);
		if (couponIndex === -1) return;

		return couponIndex + 1;
	};

	const officialStores = await Promise.all(
		$('#official-stores .game-deals-container .game-deals-item')
			.get()
			.map(async (element) => {
				const store = $(element).children('.shop-image').find('img').first().attr('alt');
				const url = await UrlUtil.getRedirectLocation(
					`https://gg.deals${$(element).children('a').first().attr('href')}`,
				);
				const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();
				const couponText = $(element).children('.game-info-wrapper').find('span.code').first().text();
				const couponPosition = getCouponPosition(couponText);

				return `> **[${store}](${url})** ${couponPosition ? `*(${couponPosition})*` : ''} - \`${price}\``;
			}),
	);

	const keyshops = await Promise.all(
		$('#keyshops .game-deals-container .game-deals-item')
			.get()
			.map(async (element) => {
				const store = $(element).children('.shop-image').find('img').first().attr('alt');
				const url = await UrlUtil.getRedirectLocation(
					`https://gg.deals${$(element).children('a').first().attr('href')}`,
				);
				const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();
				const couponText = $(element).children('.game-info-wrapper').find('span.code').first().text();
				const couponPosition = getCouponPosition(couponText);

				return `> **[${store}](${url})** ${couponPosition ? `*(${couponPosition})*` : ''} - \`${price}\``;
			}),
	);

	return {
		name,
		historicalLows,
		officialStores,
		keyshops,
		image: isValidScheme ? image : undefined,
		coupons: couponsArray.map((couponText, index) => `> *(${index + 1}) ${couponText}*`),
	};
};

export const getLatestBlogNews = async (category: BlogCategories) => {
	const options: Record<string, string> = {
		'sales': 'https://gg.deals/eu/news/deals/',
		'bundles': 'https://gg.deals/eu/news/bundles',
		'prime gaming': 'https://gg.deals/news/prime-gaming-free-games',
	};

	const data = await fetch<string>({ url: options[category] });
	const $ = load(data);

	const title = $('.news-section .news-list .news-info-wrapper .news-title a').first().text();
	const href = $('.news-section .news-list .news-info-wrapper .news-title a').first().attr('href');
	const lead = $('.news-section .news-list .news-info-wrapper .news-lead').first().text().trim();
	const image = $('.news-section .news-list .news-image-wrapper img')
		.first()
		.attr('src')
		?.replace('352cr184', '912cr476');
	const isValidScheme = /^(http|https)/g.test(image ?? '');

	return {
		title,
		lead,
		image: isValidScheme ? image : undefined,
		url: `https://gg.deals${href}`,
	};
};

export const getLatestDeals = async (category: DealCategories) => {
	const options: Record<string, string> = {
		'free games': 'https://gg.deals/eu/deals/?minDiscount=100&minRating=0&sort=date',
		'paid games': 'https://gg.deals/eu/deals/?maxDiscount=99&minRating=6&sort=date',
	};

	const data = await fetch<string>({ url: options[category] });
	const $ = load(data);

	return Promise.all(
		$('.list-items > div')
			.get()
			.map(async (element) => {
				const title = $(element).find(':nth-child(4) .game-info-title-wrapper a').text();
				const href = $(element).find(':last-child a:last-child').attr('href');
				const image = $(element).find(':nth-child(3) img').attr('src')?.replace('154x72', '616xt353');
				const store = $(element).find(':last-child .shop-icon img').attr('alt')!;
				const coupon = $(element).find(':nth-child(4) div.price-widget span.copy-code-action').text();
				const discount = $(element).find(':nth-child(4) div.price-widget span.discount').text();
				const regular = $(element).find(':nth-child(4) div.price-wrapper span.price-old').text();
				const discounted = $(element).find(':nth-child(4) div.price-wrapper span.game-price-new').text();

				const url = await UrlUtil.getRedirectLocation(`https://gg.deals${href}`);
				const isValidScheme = /^(http|https)/g.test(image ?? '');

				return {
					title,
					url,
					store,
					coupon,
					regular,
					discounted,
					discount,
					image: isValidScheme ? image : undefined,
				};
			}),
	);
};
