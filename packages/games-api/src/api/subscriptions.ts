import type { BrowserContext, Route } from 'playwright-chromium';
import type { CatalogCategory, EaPlayCategory, GamePassCategory } from '../types/category';
import type { SubscriptionCatalogEntry, SubscriptionCatalogResponse } from '../types/response';
import { logger, StringUtil } from '@luferro/shared-utils';
import { chromium } from 'playwright-chromium';

const cache = new Map<CatalogCategory, SubscriptionCatalogEntry[]>();

export const getCatalog = async (category: CatalogCategory, forceRefresh = false) => {
	if (forceRefresh || !cache.has(category)) await refreshCatalogs();
	if (!cache.has(category)) throw new Error(`Couldn't fetch **${category}** catalog.`);
	return cache.get(category);
};

export const getCatalogs = async (forceRefresh = false) => {
	if (forceRefresh) await refreshCatalogs();
	return [...cache.entries()].map(([category, catalog]) => ({ category, catalog }));
};

const refreshCatalogs = async () => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext();

	const catalogs: Record<CatalogCategory, () => Promise<SubscriptionCatalogResponse>> = {
		'PC Game Pass': () => getGamePassCatalog(context, 'PC Game Pass'),
		'Xbox Game Pass': () => getGamePassCatalog(context, 'Xbox Game Pass'),
		'EA Play': () => getEaPlayCatalog(context, 'EA Play'),
		'EA Play Pro': () => getEaPlayCatalog(context, 'EA Play Pro'),
		'Ubisoft Plus': () => getUbisoftPlusCatalog(context),
	};

	const categories: CatalogCategory[] = ['PC Game Pass', 'Xbox Game Pass', 'EA Play', 'EA Play Pro', 'Ubisoft Plus'];
	for (const category of categories) {
		try {
			const { catalog } = await catalogs[category]();
			cache.set(category, catalog);

			logger.info(`**${category}** catalog cache has been refreshed.`);
		} catch (error) {
			const { message } = error as Error;
			logger.warn(`**${category}** catalog cache failed to refresh. ${message}`);
		}
	}

	await context.close();
	await browser.close();
};

const setupPage = async (context: BrowserContext) => {
	await context.clearCookies();
	const page = await context.newPage();

	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});

	return { page };
};

const getGamePassCatalog = async (context: BrowserContext, category: GamePassCategory) => {
	const { page } = await setupPage(context);

	await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games#');
	await page.waitForLoadState('networkidle');

	if (category === 'PC Game Pass') {
		const catalogIndicator = page.locator('[data-platselected]');
		await catalogIndicator.waitFor();

		let retryCounter = 0;
		let selectedCatalog = await catalogIndicator.getAttribute('data-platselected');
		while (selectedCatalog !== 'pc') {
			if (retryCounter === 10) throw new Error('Cannot switch catalogs. Skipping PC Game Pass catalog.');

			const switchCatalogButton = page.locator('[data-theplat="pc"]');
			await switchCatalogButton.waitFor();
			await switchCatalogButton.click();

			selectedCatalog = await catalogIndicator.getAttribute('data-platselected');
			retryCounter++;
		}
	}

	const switchPageCountButton = page.locator('.paginateControl button');
	await switchPageCountButton.waitFor();
	await switchPageCountButton.click();

	const selectPageCountButton = page.locator('li[data-gamesmax="200"]');
	await selectPageCountButton.waitFor();
	await selectPageCountButton.click();

	const catalog = [];
	while (true) {
		await page.waitForTimeout(1000);

		const containers = await page.locator('.gameList [itemtype="http://schema.org/Product"]').elementHandles();
		for (const container of containers) {
			const name = await (await container.$('h3'))?.textContent();
			if (!name) continue;

			const slug = StringUtil.slug(name);
			const url = (await (await container.$('a'))?.getAttribute('href')) ?? null;

			catalog.push({ name, slug, url });
		}

		const nextPageButton = page.locator('.paginatenext:not(.pag-disabled) a');
		const hasMore = (await nextPageButton.count()) > 0;
		if (!hasMore) break;

		await nextPageButton.click();
	}
	await page.close();

	return { category, catalog: [...new Set(catalog)] };
};

const getEaPlayCatalog = async (context: BrowserContext, category: EaPlayCategory) => {
	const { page } = await setupPage(context);

	const baseUrl = 'https://gg.deals/games/';
	const url = baseUrl.concat(category === 'EA Play' ? 'ea-play-pc-games-list' : 'ea-play-pro-pc-games-list');

	await page.goto(url);
	await page.waitForLoadState('networkidle');

	const catalog = [];
	while (true) {
		await page.waitForTimeout(1000);

		const containers = await page.locator('.game-section [data-container-game-id]').elementHandles();
		for (const container of containers) {
			const name = await (await container.$('.game-info-wrapper a.game-info-title'))?.textContent();
			if (!name) continue;

			const slug = StringUtil.slug(name);
			const href = await (await container.$('a.full-link'))?.getAttribute('href');
			if (href && href.includes('dlc')) continue;

			const url = href ? `https://gg.deals${href}` : null;

			catalog.push({ name, slug, url });
		}

		const nextPageButton = page.locator('li.next-page:not(li.next-page.disabled) a');
		const hasMore = (await nextPageButton.count()) > 0;
		if (!hasMore) break;

		await nextPageButton.click();
	}
	await page.close();

	return { category, catalog: [...new Set(catalog)] };
};

const getUbisoftPlusCatalog = async (context: BrowserContext) => {
	const { page } = await setupPage(context);

	await page.goto('https://store.ubi.com/ie/ubisoftplus/games');
	await page.waitForLoadState('networkidle');

	const privacyDialog = page.locator('.privacy__modal__accept');
	await privacyDialog.waitFor();
	await privacyDialog.click();

	const regionDialog = page.locator('.stay-on-country-store');
	await regionDialog.waitFor();
	await regionDialog.click();

	while (true) {
		await page.waitForTimeout(1000);

		const loadMoreButton = page.locator("//button[contains(text(), 'Load more')]");
		const hasMore = (await loadMoreButton.count()) > 0;
		if (!hasMore) break;

		await loadMoreButton.click();
	}

	const catalog = [];
	const containers = await page.locator('.game-list_inner > div').elementHandles();
	for (const container of containers) {
		const name = await (await container.$('.game-title'))?.textContent();
		if (!name) continue;

		const slug = StringUtil.slug(name);

		catalog.push({ name, slug, url: null });
	}
	await page.close();

	return { category: 'Ubisoft Plus' as CatalogCategory, catalog: [...new Set(catalog)] };
};
