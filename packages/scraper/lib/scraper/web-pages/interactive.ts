import { type Page, type Route, chromium } from "playwright";

export type Callback<T = unknown> = (page: Page) => Promise<T>;

export class InteractiveScraper {
	async load<T = unknown>(url: string, cb: Callback<T>) {
		const browser = await chromium.launch();
		const page = await browser.newPage();

		try {
			await page.route("**/*", (route: Route) => {
				const hasResource = ["font", "image"].some((resource) => resource === route.request().resourceType());
				return hasResource ? route.abort() : route.continue();
			});
			await page.goto(url, { waitUntil: "networkidle" });
			return await cb(page);
		} finally {
			await page.close();
			await browser.close();
		}
	}

	async getHtml(url: string) {
		return this.load(url, (page) => page.content());
	}
}
