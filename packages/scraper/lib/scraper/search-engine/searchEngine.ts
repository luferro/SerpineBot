import { DateUtil } from "@luferro/shared-utils";

import { InteractiveScraper } from "../web-pages/interactive";
import { StaticScraper } from "../web-pages/static";

type Instances = { staticScraper: StaticScraper; interactiveScraper: InteractiveScraper };
type Query = { query: string };
type Interval = { interval: { start: Date | number; end?: Date | number } };

export class SearchEngine {
	private static: StaticScraper;
	private interactive: InteractiveScraper;

	constructor({ staticScraper, interactiveScraper }: Instances) {
		this.static = staticScraper;
		this.interactive = interactiveScraper;
	}

	async search({ query, interval }: Query & Partial<Interval>) {
		const url = [`https://duckduckgo.com/?q=${query}`];

		if (interval) {
			const fromStr = DateUtil.format({ date: interval.start, format: "yyyy-MM-dd" });
			const toStr = interval.end ? DateUtil.format({ date: interval.end, format: "yyyy-MM-dd" }) : fromStr;
			url.push(`&df=${fromStr}..${toStr}`);
		}

		const html = await this.interactive.getHtml({ url: url.join("") });
		const $ = this.static.loadHtml({ html });
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
