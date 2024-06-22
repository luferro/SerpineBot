import { type Logger, configureLogger } from "@luferro/helpers/logger";
import { slug } from "@luferro/helpers/transform";
import { Scraper } from "@luferro/scraper";

type Selectors = {
	list: { root: string; item: { name: string; url: { base: string | null; href: string | null } } };
	pagination: { root: string | null; nth: number; total: string | null; prev: string | null; next: string };
	cookies: string | null;
	region: string | null;
};

type Entry = { title: string; slug: string; url: string | null };

export class SubscriptionsApi {
	private logger: Logger;
	private scraper: Scraper;

	constructor() {
		this.logger = configureLogger();
		this.scraper = new Scraper();
	}

	async getCatalog(url: string, { list, pagination, cookies, region }: Selectors) {
		return this.scraper.interactive.load(url, async (page) => {
			try {
				await page.waitForTimeout(5000);

				const entries: Entry[] = [];

				const cookiesLocator = cookies ? page.locator(cookies) : null;
				if (cookiesLocator && (await cookiesLocator.isVisible())) await cookiesLocator.click();

				const regionLocator = region ? page.locator(region) : null;
				if (regionLocator && (await regionLocator.isVisible())) await regionLocator.click();

				let currentPage = 1;
				while (true) {
					await page.waitForTimeout(2000);

					const listHandles = await page.locator(list.root).elementHandles();
					for (const container of listHandles) {
						const nameElement = await container.$(list.item.name);
						const nameContent = await nameElement?.textContent();
						if (!nameContent) continue;

						const hrefElement = list.item.url.href ? await container.$(list.item.url.href) : null;
						const hrefAttribute = hrefElement ? await hrefElement.getAttribute("href") : null;
						const url = list.item.url.base ? `${list.item.url.base}${hrefAttribute}` : hrefAttribute;

						// biome-ignore lint/suspicious/noControlCharactersInRegex: remove special characters
						const noSpecialCharsTitle = nameContent.replace(/[^\x00-\x7F]/g, "");
						if (entries.find((item) => item.title === noSpecialCharsTitle)) continue;

						entries.push({ title: noSpecialCharsTitle, slug: slug(nameContent), url });
					}

					const nextLocator = page.locator(pagination.next).nth(pagination.nth);
					const paginationLocator = pagination.root ? page.locator(pagination.root).nth(pagination.nth) : null;
					const paginationTotalAttribute =
						paginationLocator && pagination.total ? await paginationLocator.getAttribute(pagination.total) : null;
					const paginationTotal = paginationTotalAttribute ? Number(paginationTotalAttribute) : null;

					const hasMore = paginationTotal ? paginationTotal !== currentPage : (await nextLocator.count()) > 0;
					if (!hasMore) break;

					await nextLocator.scrollIntoViewIfNeeded();
					await nextLocator.dispatchEvent("click");
					currentPage++;
				}
				return entries;
			} catch (error) {
				this.logger.warn(`Cannot retrieve ${url} catalog.`);
				return [];
			}
		});
	}
}
