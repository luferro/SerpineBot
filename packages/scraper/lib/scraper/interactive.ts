import { Page, Route } from 'playwright-chromium';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

type Url = { url: string };
export type Callback<T = unknown> = (page: Page) => Promise<T>;

export const load = async <T = unknown>({ url, cb }: Url & { cb: Callback<T> }) => {
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
};

export const getHtml = async ({ url }: Url) => await load({ url, cb: async (page) => await page.content() });
