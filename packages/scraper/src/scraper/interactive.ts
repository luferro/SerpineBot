import { Browser, Route } from 'playwright-chromium';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

export const load = async ({ url }: { url: string }) => {
	const browser = await chromium.launch();
	const context = await browser.newContext();
	await context.clearCookies();

	const page = await context.newPage();
	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});
	await page.goto(url, { waitUntil: 'networkidle' });

	return { browser, page };
};

export const getHtml = async ({ url }: { url: string }) => {
	const { browser, page } = await load({ url });
	const html = await page.content();
	await close({ browser });
	return html;
};

export const close = async ({ browser }: { browser: Browser }) => {
	for (const context of browser.contexts()) {
		await context.close();
	}
	await browser.close();
};
