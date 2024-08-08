import { fetcher } from "@luferro/helpers/fetch";
import { load } from "cheerio";

export class StaticScraper {
	loadHtml(html: string) {
		return load(html);
	}

	async loadUrl(url: string) {
		const { payload } = await fetcher<string>(url, {
			headers: new Map(Object.entries({ "content-type": "plain/text" })),
		});
		return this.loadHtml(payload);
	}
}
