import { EnumUtil, logger, StringUtil } from '@luferro/shared-utils';
import type { Page, Route } from 'playwright-chromium';
import { chromium } from 'playwright-chromium';

import { CatalogEnum } from '../types/enums';
import type { SubscriptionCatalogEntry } from '../types/response';

const catalogs = new Map<CatalogEnum, SubscriptionCatalogEntry[]>();

const getCatalogData = (category: CatalogEnum) => {
	const options = {
		[CatalogEnum.XboxGamePass]: {
			url: 'https://www.xbox.com/pt-PT/xbox-game-pass/games',
			list: {
				locator: '.gameList [itemtype="http://schema.org/Product"]',
				element: { name: 'h3', href: 'a' },
				next: '.paginatenext:not(.pag-disabled) a',
			},
		},
		[CatalogEnum.PcGamePass]: {
			url: 'https://gg.deals/games/xbox-game-pass-pc-games-list',
			list: {
				locator: '.game-section [data-container-game-id]',
				element: { name: '.game-info-wrapper a.game-info-title', href: 'a.full-link' },
				next: 'li.next-page:not(li.next-page.disabled) a',
			},
		},
		[CatalogEnum.EaPlay]: {
			url: 'https://gg.deals/games/ea-play-pc-games-list',
			list: {
				locator: '.game-section [data-container-game-id]',
				element: { name: '.game-info-wrapper a.game-info-title', href: 'a.full-link' },
				next: 'li.next-page:not(li.next-page.disabled) a',
			},
		},
		[CatalogEnum.EaPlayPro]: {
			url: 'https://gg.deals/games/ea-play-pro-pc-games-list',
			list: {
				locator: '.game-section [data-container-game-id]',
				element: { name: '.game-info-wrapper a.game-info-title', href: 'a.full-link' },
				next: 'li.next-page:not(li.next-page.disabled) a',
			},
		},
		[CatalogEnum.UbisoftPlus]: {
			url: 'https://gg.deals/games/ubisoft-plus-games-list',
			list: {
				locator: '.game-section [data-container-game-id]',
				element: { name: '.game-info-wrapper a.game-info-title', href: 'a.full-link' },
				next: 'li.next-page:not(li.next-page.disabled) a',
			},
		},
	};
	return options[category];
};

export const getCatalog = (category: CatalogEnum) => {
	if (!catalogs.has(category)) throw new Error(`Couldn't fetch **${category}** catalog.`);
	return catalogs.get(category);
};

export const getCatalogs = () => {
	return [...catalogs.entries()].map(([category, catalog]) => ({ category, catalog }));
};

export const refreshCatalogs = async () => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext();
	await context.clearCookies();

	const page = await context.newPage();
	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});

	for (const category of EnumUtil.enumKeysToArray(CatalogEnum)) {
		try {
			const { catalog } = await scrapeCatalog(page, CatalogEnum[category]);
			catalogs.set(CatalogEnum[category], catalog);
			logger.info(`**${category}** catalog cache has been refreshed. ${catalog.length}`);
		} catch (error) {
			logger.warn(`**${category}** catalog cache failed to refresh. ${(error as Error).message}`);
		}
	}

	await page.close();
	await context.close();
	await browser.close();
};

const scrapeCatalog = async (page: Page, category: CatalogEnum) => {
	const { url, list } = getCatalogData(category);

	await page.goto(url);
	await page.waitForLoadState('networkidle');

	const catalog = [];
	while (true) {
		await page.waitForTimeout(1000);

		const containers = await page.locator(list.locator).elementHandles();
		for (const container of containers) {
			const name = await (await container.$(list.element.name))?.textContent();
			const href = await (await container.$(list.element.href))?.getAttribute('href');
			if (!name || !href || href.match(/dlc|pack/)) continue;

			catalog.push({
				name,
				slug: StringUtil.slug(name),
				url: category === CatalogEnum.XboxGamePass ? href : `https://gg.deals${href}`,
			});
		}

		const nextPageButton = page.locator(list.next);
		const hasMore = (await nextPageButton.count()) > 0;
		if (!hasMore) break;

		await nextPageButton.click();
	}

	return { category, catalog: [...new Set(catalog)] };
};
