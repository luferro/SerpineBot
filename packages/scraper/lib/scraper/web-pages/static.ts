import { FetchUtil } from "@luferro/shared-utils";
import { load } from "cheerio";

export class StaticScraper {
	loadHtml(html: string) {
		return load(html);
	}

	async loadUrl(url: string) {
		const { payload } = await FetchUtil.fetch<string>(url, {
			headers: new Map([["content-type", "plain/text"]]),
		});
		return this.loadHtml(payload);
	}
}
