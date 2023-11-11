import { Page, Route } from 'playwright-chromium';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

type Url = { url: string };
export type Callback<T = unknown> = (page: Page) => Promise<T>;

export class InteractiveScraper {
	constructor() {
		chromium.use(StealthPlugin());
	}

	async load<T = unknown>({ url, cb }: Url & { cb: Callback<T> }) {
		const browser = await chromium.launch();
		const page = await browser.newPage();

		try {
			await page.route('**/*', (route: Route) => {
				const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
				return hasResource ? route.abort() : route.continue();
			});
			await page.goto(url, { waitUntil: 'networkidle' });
			return await cb(page);
		} finally {
			await page.close();
			await browser.close();
		}
	}

	async getHtml({ url }: Url) {
		return await this.load({ url, cb: async (page) => await page.content() });
	}
}
