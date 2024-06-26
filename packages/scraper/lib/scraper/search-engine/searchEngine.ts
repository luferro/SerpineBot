import { formatDate } from "@luferro/helpers/datetime";
import type { InteractiveScraper } from "../web-pages/interactive.js";
import type { StaticScraper } from "../web-pages/static.js";

type SearchOptions = { interval?: { start: Date | number; end?: Date | number } };

export class SearchEngine {
	constructor(
		private staticScraper: StaticScraper,
		private interactiveScraper: InteractiveScraper,
	) {}

	async search(query: string, { interval }: SearchOptions = {}) {
		let url = `https://duckduckgo.com/?q=${query}`;

		if (interval) {
			const fromStr = formatDate(interval.start, { format: "yyyy-MM-dd" });
			const toStr = interval.end ? formatDate(interval.end, { format: "yyyy-MM-dd" }) : fromStr;
			url = url.concat(`&df=${fromStr}..${toStr}`);
		}

		const html = await this.interactiveScraper.getHtml(url);
		const $ = this.staticScraper.loadHtml(html);
		return $('ol article[data-nrn="result"]')
			.get()
			.map((element) => {
				const title = $(element).find("h2").text();
				const url = $(element).find("h2 a").attr("href");
				if (!title || !url) return;

				return { title, url };
			})
			.filter((element): element is NonNullable<typeof element> => !!element);
	}
}
