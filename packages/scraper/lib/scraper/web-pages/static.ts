import { fetcher } from "@luferro/helpers/fetch";
import { load } from "cheerio";
import { HeaderGenerator } from "header-generator";

export class StaticScraper {
	loadHtml(html: string) {
		return load(html);
	}

	async loadUrl(url: string) {
		const headers = new HeaderGenerator().getHeaders({}, { "content-type": "plain/text" });
		const { payload } = await fetcher<string>(url, { headers: new Map(Object.entries(headers)) });
		return this.loadHtml(payload);
	}
}
