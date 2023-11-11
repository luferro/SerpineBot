import { Scraper } from '@luferro/scraper';
import { logger, StringUtil } from '@luferro/shared-utils';

type Catalog = { catalog: 'Xbox Game Pass' | 'PC Game Pass' | 'EA Play' | 'EA Play Pro' | 'Ubisoft Plus' };

export class SubscriptionsApi extends Scraper {
	private getSelectors({ catalog }: Catalog) {
		const options = {
			'Xbox Game Pass': {
				list: {
					element: '.gameList [itemtype="http://schema.org/Product"]',
					item: { name: 'h3', href: 'a', base: null },
				},
				pagination: { nth: 0, element: null, total: null, next: '.paginatenext:not(.pag-disabled) a' },
				cookies: null,
				region: null,
			},
			'PC Game Pass': {
				list: {
					element: '.gameList [itemtype="http://schema.org/Product"]',
					item: { name: 'h3', href: 'a', base: null },
				},
				pagination: { nth: 0, element: null, total: null, next: '.paginatenext:not(.pag-disabled) a' },
				cookies: null,
				region: null,
			},
			'EA Play': {
				list: { element: 'ea-box-set ea-game-box', item: { name: 'a', href: 'a', base: 'https://www.ea.com' } },
				pagination: {
					nth: 0,
					element: 'ea-pagination',
					total: 'total-pages',
					next: 'span[data-page-target=next]',
				},
				cookies: null,
				region: null,
			},
			'EA Play Pro': {
				list: { element: 'ea-box-set ea-game-box', item: { name: 'a', href: 'a', base: 'https://www.ea.com' } },
				pagination: {
					nth: 1,
					element: 'ea-pagination',
					total: 'total-pages',
					next: 'span[data-page-target=next]',
				},
				cookies: null,
				region: null,
			},
			'Ubisoft Plus': {
				list: { element: 'div.game', item: { name: 'p.game-title', href: null, base: null } },
				pagination: { nth: 0, element: null, total: null, next: '.game-list_wrapper ~ div button' },
				cookies: 'button#privacy__modal__accept',
				region: 'button.stay-on-country-store',
			},
		};
		return options[catalog];
	}

	async getCatalog({ catalog }: Catalog) {
		const catalogUrl: Record<typeof catalog, string> = {
			'Xbox Game Pass': 'https://www.xbox.com/pt-PT/xbox-game-pass/games',
			'PC Game Pass': 'https://www.xbox.com/pt-PT/xbox-game-pass/games#pcgames',
			'EA Play': 'https://www.ea.com/ea-play/games#ea-app',
			'EA Play Pro': 'https://www.ea.com/ea-play/games#ea-play-pro',
			'Ubisoft Plus': 'https://store.ubisoft.com/ie/Ubisoftplus/games',
		};

		return await this.interactive.load({
			url: catalogUrl[catalog],
			cb: async (page) => {
				try {
					await page.waitForTimeout(5000);

					const entries: { name: string; slug: string; url: string | null }[] = [];
					const { list, pagination, cookies, region } = this.getSelectors({ catalog });

					const cookiesButton = cookies ? page.locator(cookies) : null;
					if (cookiesButton && (await cookiesButton.isVisible())) await cookiesButton.click();

					const regionButton = region ? page.locator(region) : null;
					if (regionButton && (await regionButton?.isVisible())) await regionButton.click();

					let currentPage = 1;
					while (true) {
						await page.waitForTimeout(2000);

						const containers = await page.locator(list.element).elementHandles();
						for (const container of containers) {
							const name = await (await container.$(list.item.name))?.textContent();
							const href = list.item.href
								? await (await container.$(list.item.href))?.getAttribute('href')
								: null;
							const url = list.item.base ? `${list.item.base}${href}` : href;
							if (!name) continue;

							// eslint-disable-next-line no-control-regex
							const fixedName = name.replace(/[^\x00-\x7F]/g, '');
							if (entries.find((item) => item.name === fixedName)) continue;

							entries.push({ name: fixedName, slug: StringUtil.slug(name), url: url ?? null });
						}

						const nextPageButton = page.locator(pagination.next).nth(pagination.nth);
						const totalPages =
							pagination.element && pagination.total
								? Number(
										(await page
											.locator(pagination.element)
											.nth(pagination.nth)
											.getAttribute(pagination.total))!,
								  )
								: null;

						const hasMore = totalPages ? totalPages !== currentPage : (await nextPageButton.count()) > 0;
						if (!hasMore) break;

						await nextPageButton.scrollIntoViewIfNeeded();
						await nextPageButton.click();
						currentPage++;
					}
					return { catalog, entries };
				} catch (error) {
					logger.warn(`Cannot retrieve **${catalog}** catalog.`);
					return { catalog, entries: [] };
				}
			},
		});
	}

	async getCatalogs() {
		const data = [];
		for (const catalog of ['Xbox Game Pass', 'PC Game Pass', 'EA Play', 'EA Play Pro', 'Ubisoft Plus'] as const) {
			data.push(await this.getCatalog({ catalog }));
		}
		return data;
	}
}
