import { StaticScraper } from '@luferro/scraper';
import { UrlUtil } from '@luferro/shared-utils';

export enum Endpoint {
	SEARCH = 'https://gg.deals/eu/games/?view=list&title=:title',
	GAME_PAGE = 'https://gg.deals/eu/game/:id',
	LATEST_PAID_DEALS = 'https://gg.deals/eu/deals/?maxDiscount=99&minRating=8&sort=date',
	LATEST_FREE_DEALS = 'https://gg.deals/eu/deals/?minDiscount=100&minRating=0&sort=date',
	LATEST_SALES = 'https://gg.deals/eu/news/deals',
	LATEST_BUNDLES = 'https://gg.deals/eu/news/bundles',
	LATEST_PRIME_GAMING = 'https://gg.deals/eu/news/prime-gaming-free-games',
}

export const getFirstSearchResult = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });
	const href = $('#games-list .game-list-item a').first().attr('href');
	const id = href?.match(/\/game\/(.*)\//)?.pop() ?? null;
	return { id };
};

export const getDealDetails = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });

	const name = $('.image-game').first().attr('alt')!;
	const image = $('.image-game')
		.first()
		.attr('src')
		?.replace(/307(.*?)176/, '616xt353');

	const coupons: string[] = [];
	const stores = await Promise.all(
		$('#offers .game-deals-container .similar-deals-container > .game-deals-item')
			.get()
			.map(async (element) => {
				const isKeyshop = $(element).children('.game-info-wrapper').find('.tag-risks').length > 0;
				const name = $(element).children('.shop-image').find('img').first().attr('alt')!;
				const price = $(element).children('.game-info-wrapper').find('.game-price-current').first().text();
				const href = $(element).children('a').first().attr('href')!;
				const url = await UrlUtil.getRedirectLocation(`https://gg.deals${href}`);
				const coupon =
					$(element)
						.children('.game-info-wrapper')
						.find('span.code')
						.first()
						.attr('data-clipboard-text')
						?.trim() || null;

				let position = null;
				if (coupon) {
					const index = coupons.findIndex((storedCoupon) => storedCoupon === coupon);
					if (index === -1) coupons.push(coupon);
					position = index === -1 ? coupons.length : index + 1;
				}

				return {
					name,
					url,
					price,
					coupon: { position, text: coupon },
					isOfficialStore: !isKeyshop,
				};
			}),
	);

	const historicalLows = $('#game-lowest-tab-price .game-lowest-price-row')
		.get()
		.map((element) => {
			const tag = $(element).find('.game-lowest-price-inner-row .price-type').first().text();
			const price = $(element).find('.game-lowest-price-inner-row .price span').first().text();
			const store = $(element).find('.game-lowest-price-details-row .shop-name').first().text();
			const activeStatus = $(element).find('.game-lowest-price-details-row .active').first().text().trim();
			const expireStatus = $(element).find('.game-lowest-price-details-row .timeago').first().text().trim();

			return `> __${tag}__ \`${price}\` @ ${store} - ${activeStatus || expireStatus}`;
		});

	return {
		name,
		stores,
		coupons,
		historicalLows,
		image: image?.startsWith('http') ? image : null,
	};
};

export const getLatestBlogPost = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });

	const title = $('.news-section .news-list .news-info-wrapper .news-title a').first().text();
	const href = $('.news-section .news-list .news-info-wrapper .news-title a').first().attr('href')!;
	const lead = $('.news-section .news-list .news-info-wrapper .news-lead').first().text().trim();
	const image = $('.news-section .news-list .news-image-wrapper img')
		.first()
		.attr('src')
		?.replace(/352(.*?)184/, '912cr476');

	return {
		title,
		lead,
		image: image?.startsWith('http') ? image : null,
		url: `https://gg.deals${href}`,
	};
};

export const getLatestDeals = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });

	return await Promise.all(
		$('.list-items > div')
			.get()
			.map(async (element) => {
				const title = $(element).find(':nth-child(4) .game-info-title-wrapper a').text();
				const href = $(element).find(':last-child a:last-child').attr('href');
				const url = {
					original: `https://gg.deals${href}`,
					redirect: await UrlUtil.getRedirectLocation(`https://gg.deals${href}`),
				};
				const image = $(element)
					.find(':nth-child(3) img')
					.attr('src')
					?.replace(/154(.*?)72/, '616xt353');
				const store = $(element).find(':last-child .shop-icon img').attr('alt')!;
				const coupon = $(element).find(':nth-child(4) div.price-widget span.copy-code-action').text();
				const discount = $(element).find(':nth-child(4) div.price-widget span.discount').text();
				const regular = $(element).find(':nth-child(4) div.price-wrapper span.price-old').text();
				const discounted = $(element).find(':nth-child(4) div.price-wrapper span.game-price-new').text();

				return {
					title,
					url,
					store,
					coupon,
					regular,
					discounted,
					discount,
					image: image?.startsWith('http') ? image : null,
				};
			}),
	);
};
