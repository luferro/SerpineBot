import { InteractiveScraper } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';

type Catalog = { name: string; slug: string; url?: string | null };

export enum Endpoint {
	XBOX_GAME_PASS_CATALOG = 'https://www.xbox.com/pt-PT/xbox-game-pass/games',
	PC_GAME_PASS_CATALOG = 'https://www.xbox.com/pt-PT/xbox-game-pass/games#pcgames',
	EA_PLAY_CATALOG = 'https://www.ea.com/ea-play/games#ea-app',
	EA_PLAY_PRO_CATALOG = 'https://www.ea.com/ea-play/games#ea-play-pro',
	UBISOFT_PLUS_CATALOG = 'https://store.ubisoft.com/ie/Ubisoftplus/games',
}

export const getCatalogList = async (url: Endpoint) => {
	const { browser, page } = await InteractiveScraper.load({ url });
	await page.waitForTimeout(5000);

	const { cookies, list, pagination } = getSelectors(url);
	if (cookies) await page.locator(cookies).click();

	const catalog: Catalog[] = [];

	let currentPage = 1;
	while (true) {
		await page.waitForTimeout(2000);

		const containers = await page.locator(list.element).elementHandles();
		for (const container of containers) {
			const name = await (await container.$(list.item.name))?.textContent();
			const href = list.item.href ? await (await container.$(list.item.href))?.getAttribute('href') : null;
			const url = list.item.base ? `${list.item.base}${href}` : href;
			if (!name) continue;

			const isPresent = catalog.find((item) => item.name === name);
			if (isPresent) continue;

			// eslint-disable-next-line no-control-regex
			catalog.push({ name: name.replace(/[^\x00-\x7F]/g, ''), slug: StringUtil.slug(name), url });
		}

		const nextPageButton = page.locator(pagination.next).nth(pagination.nth);
		const totalPages =
			pagination.element && pagination.total
				? Number((await page.locator(pagination.element).nth(pagination.nth).getAttribute(pagination.total))!)
				: null;

		const hasMore = totalPages ? totalPages !== currentPage : (await nextPageButton.count()) > 0;
		if (!hasMore) break;

		await nextPageButton.scrollIntoViewIfNeeded();
		await nextPageButton.click();
		currentPage++;
	}
	await InteractiveScraper.close({ browser });

	return catalog;
};

const getSelectors = (url: Endpoint) => {
	const options = {
		[Endpoint.XBOX_GAME_PASS_CATALOG]: {
			list: {
				element: '.gameList [itemtype="http://schema.org/Product"]',
				item: { name: 'h3', href: 'a', base: null },
			},
			pagination: { nth: 0, element: null, total: null, next: '.paginatenext:not(.pag-disabled) a' },
			cookies: null,
		},
		[Endpoint.PC_GAME_PASS_CATALOG]: {
			list: {
				element: '.gameList [itemtype="http://schema.org/Product"]',
				item: { name: 'h3', href: 'a', base: null },
			},
			pagination: { nth: 0, element: null, total: null, next: '.paginatenext:not(.pag-disabled) a' },
			cookies: null,
		},
		[Endpoint.EA_PLAY_CATALOG]: {
			list: { element: 'ea-box-set ea-game-box', item: { name: 'a', href: 'a', base: 'https://www.ea.com' } },
			pagination: { nth: 0, element: 'ea-pagination', total: 'total-pages', next: 'span[data-page-target=next]' },
			cookies: null,
		},
		[Endpoint.EA_PLAY_PRO_CATALOG]: {
			list: { element: 'ea-box-set ea-game-box', item: { name: 'a', href: 'a', base: 'https://www.ea.com' } },
			pagination: { nth: 1, element: 'ea-pagination', total: 'total-pages', next: 'span[data-page-target=next]' },
			cookies: null,
		},

		[Endpoint.UBISOFT_PLUS_CATALOG]: {
			list: { element: 'div.game', item: { name: 'p.game-title', href: null, base: null } },
			pagination: { nth: 0, element: null, total: null, next: '.game-list_wrapper ~ div button' },
			cookies: '#privacy__modal__accept',
		},
	};
	return options[url];
};
