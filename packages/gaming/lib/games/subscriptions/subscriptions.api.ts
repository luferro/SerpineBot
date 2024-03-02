import { Scraper } from "@luferro/scraper";
import { LoggerUtil, ObjectUtil, StringUtil } from "@luferro/shared-utils";

const CatalogType = {
	XBOX_GAME_PASS: "XBOX_GAME_PASS",
	PC_GAME_PASS: "PC_GAME_PASS",
	UBISOFT_PLUS: "UBISOFT_PLUS",
	EA_PLAY_PRO: "EA_PLAY_PRO",
	EA_PLAY: "EA_PLAY",
} as const;

export class SubscriptionsApi extends Scraper {
	private logger: LoggerUtil.Logger;

	constructor() {
		super();
		this.logger = LoggerUtil.configureLogger();
	}

	private getSelectors(type: keyof typeof CatalogType) {
		const options = {
			[CatalogType.XBOX_GAME_PASS]: {
				list: {
					element: '.gameList [itemtype="http://schema.org/Product"]',
					item: { name: "h3", href: "a", base: null },
				},
				pagination: { nth: 0, element: null, total: null, next: ".paginatenext:not(.pag-disabled) a" },
				cookies: null,
				region: null,
			},
			[CatalogType.PC_GAME_PASS]: {
				list: {
					element: '.gameList [itemtype="http://schema.org/Product"]',
					item: { name: "h3", href: "a", base: null },
				},
				pagination: { nth: 0, element: null, total: null, next: ".paginatenext:not(.pag-disabled) a" },
				cookies: null,
				region: null,
			},
			[CatalogType.EA_PLAY]: {
				list: { element: "ea-box-set ea-game-box", item: { name: "a", href: "a", base: "https://www.ea.com" } },
				pagination: {
					nth: 0,
					element: "ea-pagination",
					total: "total-pages",
					next: "span[data-page-target=next]",
				},
				cookies: null,
				region: null,
			},
			[CatalogType.EA_PLAY_PRO]: {
				list: { element: "ea-box-set ea-game-box", item: { name: "a", href: "a", base: "https://www.ea.com" } },
				pagination: {
					nth: 1,
					element: "ea-pagination",
					total: "total-pages",
					next: "span[data-page-target=next]",
				},
				cookies: null,
				region: null,
			},
			[CatalogType.UBISOFT_PLUS]: {
				list: { element: "div.game", item: { name: "p.game-title", href: null, base: null } },
				pagination: { nth: 0, element: null, total: null, next: ".game-list_wrapper ~ div button" },
				cookies: "button#privacy__modal__accept",
				region: "button.stay-on-country-store",
			},
		};
		return options[type];
	}

	async getCatalog(type: keyof typeof CatalogType) {
		const catalogUrl = {
			[CatalogType.XBOX_GAME_PASS]: "https://www.xbox.com/pt-PT/xbox-game-pass/games",
			[CatalogType.PC_GAME_PASS]: "https://www.xbox.com/pt-PT/xbox-game-pass/games#pcgames",
			[CatalogType.EA_PLAY]: "https://www.ea.com/ea-play/games#ea-app",
			[CatalogType.EA_PLAY_PRO]: "https://www.ea.com/ea-play/games#ea-play-pro",
			[CatalogType.UBISOFT_PLUS]: "https://store.ubisoft.com/ie/Ubisoftplus/games",
		};

		return this.interactive.load(catalogUrl[type], async (page) => {
			try {
				await page.waitForTimeout(5000);

				const catalog: { title: string; slug: string; url: string | null }[] = [];
				const { list, pagination, cookies, region } = this.getSelectors(type);

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
						const href = list.item.href ? await (await container.$(list.item.href))?.getAttribute("href") : null;
						const url = list.item.base ? `${list.item.base}${href}` : href;
						if (!name) continue;

						// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
						const fixedName = name.replace(/[^\x00-\x7F]/g, "");
						if (catalog.find((item) => item.title === fixedName)) continue;

						catalog.push({ title: fixedName, slug: StringUtil.slug(name), url: url ?? null });
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
				return { type, catalog };
			} catch (error) {
				this.logger.warn(`Cannot retrieve ${type} catalog`);
				return { type, catalog: [] };
			}
		});
	}

	async getCatalogs() {
		const data = [];
		for (const type of ObjectUtil.enumToArray(CatalogType)) {
			data.push(await this.getCatalog(type));
		}
		return data;
	}
}
