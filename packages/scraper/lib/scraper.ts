import { type CheerioAPI, load } from "cheerio";
import { newInjectedContext } from "fingerprint-injector";
import { HeaderGenerator } from "header-generator";
import { type Page, type Route, chromium } from "playwright";

export type Callback<T = unknown> = (page: Page) => Promise<T>;

export function getHeaders() {
	return new HeaderGenerator().getHeaders();
}

export function getHtml(url: string) {
	return loadUrl(url, (page) => page.content());
}

export function loadHtml(html: string) {
	return load(html);
}

export async function loadUrl<T = CheerioAPI>(url: string): Promise<T>;
export async function loadUrl<T = unknown>(url: string, cb: Callback<T>): Promise<T>;
export async function loadUrl<T = unknown | CheerioAPI>(url: string, cb?: Callback<T>) {
	if (!cb) {
		const headers = getHeaders();
		const response = await fetch(url, { headers: { ...headers, "content-type": "plain/text" } });
		const html = await response.text();
		return loadHtml(html);
	}

	const browser = await chromium.launch();
	const context = await newInjectedContext(browser);
	const page = await context.newPage();

	try {
		await page.route("**/*", (route: Route) => {
			const hasResource = ["font", "image"].some((resource) => resource === route.request().resourceType());
			return hasResource ? route.abort() : route.continue();
		});
		await page.goto(url, { waitUntil: "networkidle" });
		return await cb(page);
	} finally {
		await page.close();
		await context.close();
		await browser.close();
	}
}
