import type { BrowserContext, Page, Route } from 'playwright-chromium';
import type { CatalogCategory, EaPlayCategory, GamePassCategory } from '../types/category';
import type { SubscriptionCatalogResponse } from '../types/response';
import { StringUtil } from '@luferro/shared-utils';
import { chromium } from 'playwright-chromium';

export const getCatalog = async (category: CatalogCategory) => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext();

	try {
		const catalogs: Record<typeof category, () => Promise<SubscriptionCatalogResponse>> = {
			'PC Game Pass': () => getGamePassCatalog(context, 'PC Game Pass'),
			'Xbox Game Pass': () => getGamePassCatalog(context, 'Xbox Game Pass'),
			'EA Play': () => getEaPlayCatalog(context, 'EA Play'),
			'EA Play Pro': () => getEaPlayCatalog(context, 'EA Play Pro'),
			'Ubisoft Plus': () => getUbisoftPlusCatalog(context),
		};

		return await catalogs[category]();
	} finally {
		await browser.close();
	}
};

const abortUnnecessaryResources = async (page: Page) => {
	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});
};

const getGamePassCatalog = async (context: BrowserContext, category: GamePassCategory) => {
	const page = await context.newPage();
	await abortUnnecessaryResources(page);

	await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games');
	await page.waitForLoadState('networkidle');

	if (category === 'PC Game Pass') {
		const switchCatalogButton = page.locator('[data-theplat="pc"]');
		await switchCatalogButton.waitFor();
		await switchCatalogButton.click();

		const isSelected = (await page.locator('[data-platselected="pc"]').count()) > 0;
		if (!isSelected) throw new Error("Couldn't switch catalogs. Skipping PC Game Pass catalog.");
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
	const page = await context.newPage();
	await abortUnnecessaryResources(page);

	if (category === 'EA Play')
		await page.goto(
			'https://www.origin.com/irl/en-us/store/browse?fq=gameType:basegame,subscriptionGroup:vault-games',
		);
	else
		await page.goto(
			'https://www.origin.com/irl/en-us/store/browse?fq=gameType:basegame,subscriptionGroup:premium-vault-games',
		);
	await page.waitForLoadState('networkidle');

	const regionMenu = page.locator('.otkmodal-content .otkmodal-footer > button');
	await regionMenu.waitFor();
	await regionMenu.click();
	await page.waitForTimeout(500);
	await regionMenu.click();

	let previousHeight = await page.evaluate('document.body.scrollHeight');
	while (true) {
		await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
		await page.waitForTimeout(500);

		const currentHeight = await page.evaluate('document.body.scrollHeight');
		if (currentHeight === previousHeight) break;

		previousHeight = currentHeight;
	}

	const catalog = [];
	const containers = await page.locator('section.origin-gdp-tilelist > ul li[origin-postrepeat]').elementHandles();
	for (const container of containers) {
		const name = await (await container.$('h1.home-tile-header'))?.textContent();
		if (!name) continue;

		const slug = StringUtil.slug(name);
		const url = (await (await container.$('a'))?.getAttribute('href')) ?? null;

		catalog.push({ name, slug, url });
	}
	await page.close();

	return { category, catalog: [...new Set(catalog)] };
};

export const getUbisoftPlusCatalog = async (context: BrowserContext) => {
	const page = await context.newPage();
	await abortUnnecessaryResources(page);

	await page.goto('https://store.ubi.com/ie/ubisoftplus/games');
	await page.waitForLoadState('networkidle');

	const privacyDialog = page.locator('.privacy__modal__accept');
	const hasPrivacyDialog = (await privacyDialog.count()) > 0;
	if (hasPrivacyDialog) await privacyDialog.click();

	const regionDialog = page.locator('.stay-on-country-store');
	const hasRegionDialog = (await regionDialog.count()) > 0;
	if (hasRegionDialog) await regionDialog.click();

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
