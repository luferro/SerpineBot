import { chromium, Page, Route } from 'playwright-chromium';
import * as StringUtil from '../utils/string';
import { subscriptionsModel } from '../database/models/subscriptions';
import { GamePassCategories, EAPlayCategories } from '../types/categories';
import { timeout } from '../utils/sleep';
import { logger } from '../utils/logger';

export const data = {
	name: 'subscriptions',
	schedule: '0 0 15 * * *',
};

export const execute = async () => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext();

	const functions = [
		(page: Page) => getGamePass(page, 'Xbox'),
		(page: Page) => getGamePass(page, 'PC'),
		(page: Page) => getEAPlay(page, 'Base'),
		(page: Page) => getEAPlay(page, 'Pro'),
		(page: Page) => getUbisoftPlus(page),
	];

	try {
		for (const fetchSubscription of functions) {
			await timeout(1000 * 60);

			const page = await context.newPage();
			await page.route('**/*', (route: Route) => {
				const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
				return hasResource ? route.abort() : route.continue();
			});

			await fetchSubscription(page);
			await page.close();
		}
	} finally {
		await browser.close();
	}
};

const getGamePass = async (page: Page, category: GamePassCategories) => {
	await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games');
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(5000);

	if (category === 'PC') await page.click(`[data-theplat="pc"]`);

	const items = [];
	while (true) {
		await page.waitForTimeout(1000);

		const data = await page.$$eval('.gameList [itemtype="http://schema.org/Product"]', (elements) => {
			return elements
				.map((element) => {
					const name = element.querySelector('h3')?.textContent;
					if (!name) return;

					return {
						name,
						url: element.querySelector('a')?.href,
					};
				})
				.filter((element): element is NonNullable<typeof element> => !!element);
		});
		items.push(...data.map((item) => ({ ...item, slug: StringUtil.slug(item.name) })));

		const hasMore = (await page.$$('.paginatenext:not(.pag-disabled) a')).length > 0;
		if (!hasMore) break;

		await page.click('.paginatenext:not(.pag-disabled) a');
	}

	const subscription = await subscriptionsModel.findOne({ name: `${category} Game Pass` });
	if (items.length < Math.round((subscription?.items.length ?? 0) * 0.6)) return;

	await subscriptionsModel.updateOne(
		{ name: `${category} Game Pass` },
		{ $set: { items, count: items.length } },
		{ upsert: true },
	);

	logger.info(`Subscriptions job found _*${items.length}*_ items for _*${category} Game Pass*_.`);
};

const getUbisoftPlus = async (page: Page) => {
	await page.goto('https://store.ubi.com/eu/ubisoftplus/games');
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(5000);

	const hasCookiesMenu = (await page.$$('.privacy__modal__accept')).length > 0;
	if (hasCookiesMenu) await page.click('.privacy__modal__accept');

	const hasRegionMenu = (await page.$$('.stay-on-country-store')).length > 0;
	if (hasRegionMenu) await page.click('.stay-on-country-store');

	while (true) {
		await page.waitForTimeout(1000);
		const button = await page.$("//button[contains(text(), 'Load more')]");
		if (!button) break;

		await button.click();
	}

	const data = await page.$$eval('.game-list_inner > div', (elements) => {
		return elements
			.map((element) => {
				const shortTitle = element.querySelector('h3.game-short-title')!.textContent!;
				const longTitle = element.querySelector('h3.game-long-title')!.textContent!;
				if (!shortTitle && !longTitle) return;

				return {
					name: longTitle || shortTitle,
					url: undefined,
				};
			})
			.filter((element): element is NonNullable<typeof element> => !!element);
	});
	const items = [...data.map((item) => ({ ...item, slug: StringUtil.slug(item.name) }))];

	const subscription = await subscriptionsModel.findOne({ name: 'Ubisoft+' });
	if (items.length < Math.round((subscription?.items.length ?? 0) * 0.6)) return;

	await subscriptionsModel.updateOne(
		{ name: 'Ubisoft+' },
		{ $set: { items, count: items.length } },
		{ upsert: true },
	);

	logger.info(`Subscriptions job found _*${items.length}*_ items for _*Ubisoft+*_.`);
};

const getEAPlay = async (page: Page, category: EAPlayCategories) => {
	await page.goto(
		`https://www.origin.com/irl/en-us/store/browse?fq=subscriptionGroup:${
			category === 'Pro' ? 'premium-' : ''
		}vault-games`,
	);
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(5000);

	const hasRegionMenu = (await page.$$('.otkmodal-content .otkmodal-footer > button')).length > 0;
	if (hasRegionMenu) {
		await page.click('.otkmodal-content .otkmodal-footer > button');
		await page.waitForTimeout(2000);

		const hasConfirmationRegionMenu = (await page.$$('.otkmodal-content .otkmodal-footer > button')).length > 0;
		if (hasConfirmationRegionMenu) await page.click('.otkmodal-content .otkmodal-footer > button');
	}

	let lastHeight = await page.evaluate('document.body.scrollHeight');
	while (true) {
		await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
		await page.waitForTimeout(2000);

		const newHeight = await page.evaluate('document.body.scrollHeight');
		if (newHeight === lastHeight) break;
		lastHeight = newHeight;
	}

	const data = await page.$$eval('section.origin-gdp-tilelist > ul li[origin-postrepeat]', (elements) => {
		return elements
			.map((element) => {
				const name = element.querySelector('h1.home-tile-header')?.textContent;
				if (!name) return;

				return {
					name,
					url: element.querySelector('a')?.href,
				};
			})
			.filter((element): element is NonNullable<typeof element> => !!element);
	});
	const items = [...data.map((item) => ({ ...item, slug: StringUtil.slug(item.name) }))];

	const subscription = await subscriptionsModel.findOne({ name: category === 'Pro' ? 'EA Play Pro' : 'EA Play' });
	if (items.length < Math.round((subscription?.items.length ?? 0) * 0.6)) return;

	await subscriptionsModel.updateOne(
		{ name: category === 'Pro' ? 'EA Play Pro' : 'EA Play' },
		{ $set: { items, count: items.length } },
		{ upsert: true },
	);

	logger.info(
		`Subscriptions job found _*${items.length}*_ items for _*${category === 'Pro' ? 'EA Play Pro' : 'EA Play'}*_.`,
	);
};
