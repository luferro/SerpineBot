import { DateUtil, LoggerUtil } from "@luferro/shared-utils";
import Parser from "rss-parser";
import type { StaticScraper } from "../web-pages/static";

type Image = { isExternal?: boolean; selector: string };
type ImageOptions = { image: Image } | null;
type Feeds = { url: string; options: ImageOptions }[];

export class RSS extends Parser {
	private logger: LoggerUtil.Logger;

	constructor(private staticScraper: StaticScraper) {
		super();
		this.logger = LoggerUtil.configureLogger();
	}

	private async retrieveExternalImage(url: string, selector: string) {
		const $ = await this.staticScraper.loadUrl(url);
		return $(selector).first().attr("src") ?? null;
	}

	private async retrieveInternalImage(html: string, selector: string, url?: string) {
		const $ = this.staticScraper.loadHtml(html);
		const image = $(selector).first().attr("src");
		if (!image && url) return this.retrieveExternalImage(url, selector);
		return image ?? null;
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
					.filter(({ isoDate }) => isoDate && DateUtil.isToday(new Date(isoDate)))
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
							if (options?.image) {
								const { isExternal, selector } = options.image;
								const html = encodedContent ?? content;
								image =
									isExternal && link
										? await this.retrieveExternalImage(link, selector)
										: await this.retrieveInternalImage(html, selector, link);
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
