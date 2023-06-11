import { FetchUtil } from '@luferro/shared-utils';
import { Browser, BrowserContext, chromium, Route } from 'playwright-chromium';

export const load = async ({ url }: { url: string }) => {
	const browser = await chromium.launch({ chromiumSandbox: false });
	const context = await browser.newContext({ extraHTTPHeaders: FetchUtil.getHeaders({}) });
	await context.clearCookies();

	const page = await context.newPage();
	await page.route('**/*', (route: Route) => {
		const hasResource = ['font', 'image'].some((resource) => resource === route.request().resourceType());
		return hasResource ? route.abort() : route.continue();
	});
	await page.goto(url, { waitUntil: 'networkidle' });

	return { browser, context, page };
};

export const getHtml = async ({ url }: { url: string }) => {
	const { browser, context, page } = await load({ url });
	const html = await page.content();
	await close({ browser, context });
	return html;
};

export const close = async ({ browser, context }: { browser: Browser; context: BrowserContext }) => {
	await context.close();
	await browser.close();
};
