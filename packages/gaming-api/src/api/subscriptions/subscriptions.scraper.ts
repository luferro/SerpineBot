import { InteractiveScraper } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';

export enum Endpoint {
	XBOX_GAME_PASS_CATALOG = 'https://www.xbox.com/pt-PT/xbox-game-pass/games',
	PC_GAME_PASS_CATALOG = 'https://gg.deals/games/xbox-game-pass-pc-games-list',
	EA_PLAY_CATALOG = 'https://gg.deals/games/ea-play-pc-games-list',
	EA_PLAY_PRO_CATALOG = 'https://gg.deals/games/ea-play-pro-pc-games-list',
	UBISOFT_PLUS_CATALOG = 'https://gg.deals/games/ubisoft-plus-games-list',
}

export const getCatalogList = async (url: Endpoint) => {
	const { browser, context, page } = await InteractiveScraper.load({ url });
	const { element, locator, next } = getSelectors(url);

	const catalog = [];
	while (true) {
		await page.waitForTimeout(1000);

		const containers = await page.locator(locator).elementHandles();
		for (const container of containers) {
			const name = await (await container.$(element.name))?.textContent();
			const href = await (await container.$(element.href))?.getAttribute('href');
			if (!name || !href || href.match(/dlc|pack/)) continue;

			catalog.push({
				name,
				slug: StringUtil.slug(name),
				url: url === Endpoint.XBOX_GAME_PASS_CATALOG ? href : `https://gg.deals${href}`,
			});
		}

		const nextPageButton = page.locator(next);
		const hasMore = (await nextPageButton.count()) > 0;
		if (!hasMore) break;

		await nextPageButton.click();
	}
	await InteractiveScraper.close({ browser, context });

	return [...new Set(catalog)];
};

const getSelectors = (url: Endpoint) => {
	if (url === Endpoint.XBOX_GAME_PASS_CATALOG) {
		return {
			locator: '.gameList [itemtype="http://schema.org/Product"]',
			element: { name: 'h3', href: 'a' },
			next: '.paginatenext:not(.pag-disabled) a',
		};
	}

	return {
		locator: '.game-section [data-container-game-id]',
		element: { name: '.game-info-wrapper a.game-info-title', href: 'a.full-link' },
		next: 'li.next-page:not(li.next-page.disabled) a',
	};
};
