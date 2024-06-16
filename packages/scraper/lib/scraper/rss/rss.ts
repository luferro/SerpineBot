import { isToday } from "@luferro/helpers/datetime";
import { type Logger, configureLogger } from "@luferro/helpers/logger";
import Parser from "rss-parser";
import type { StaticScraper } from "../web-pages/static.js";

type Feeds = { url: string; options?: { image: { external: boolean; selector: string } } }[];

export class RSS extends Parser {
	private logger: Logger;

	constructor(private staticScraper: StaticScraper) {
		super();
		this.logger = configureLogger();
	}

	private async retrieveExternalImage(url: string, selector: string) {
		const $ = await this.staticScraper.loadUrl(url);
		return $(selector).first().attr("src") ?? null;
	}

	private async retrieveInternalImage(html: string, selector: string) {
		const $ = this.staticScraper.loadHtml(html);
		return $(selector).first().attr("src") ?? null;
	}

	private async parse(url: string) {
		try {
			return await this.parseURL(url);
		} catch (error) {
			this.logger.warn(`RSS | Failed to parse ${url}`);
			return null;
		}
	}

	async consume(feeds: Feeds) {
		const data = [];
		for (const { url, options } of feeds) {
			const output = await this.parse(url);
			if (!output) continue;

			const items = await Promise.all(
				output.items
					.filter(({ isoDate }) => isoDate && isToday(new Date(isoDate)))
					.map(
						async ({
							creator,
							categories,
							title,
							link,
							content,
							"content:encoded": encodedContent,
							contentSnippet,
							isoDate,
						}) => {
							let image: string | null = null;
							if (options) {
								const { external, selector } = options.image;
								const html = encodedContent ?? content;
								const internalImage = await this.retrieveInternalImage(html, selector);
								const externalImage = external && link ? await this.retrieveExternalImage(link, selector) : null;
								image = externalImage ?? internalImage;
							}

							return {
								creator: creator ?? null,
								categories: categories ?? [],
								title: title!,
								url: link!,
								description: contentSnippet!,
								image: image?.startsWith("http") ? image : null,
								publishedAt: isoDate ? new Date(isoDate) : new Date(),
							};
						},
					),
			);
			data.push(...items);
		}
		return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
	}
}
