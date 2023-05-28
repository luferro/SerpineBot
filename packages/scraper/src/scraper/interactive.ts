import { Browser, BrowserContext, chromium, Route } from 'playwright-chromium';

export const load = async (url: string) => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext();
	await context.clearCookies();

	const page = await context.newPage();
	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});

	await page.goto(url);
	await page.waitForLoadState('networkidle');

	return { browser, context, page };
};

export const close = async ({ browser, context }: { browser: Browser; context: BrowserContext }) => {
	await context.close();
	await browser.close();
};
