import { Scraper } from "@luferro/scraper";
import { DateUtil } from "@luferro/shared-utils";

import { Id, Query, Slug } from "../../../../types/args";

export class ReviewsApi extends Scraper {
	private static BASE_URL = "https://opencritic.com";

	async search({ query }: Partial<Query>) {
		const results = await this.engine.search({
			query: `${query ?? "reviews"} site:${ReviewsApi.BASE_URL}/game`,
			interval: query ? undefined : { start: Date.now() },
		});

		const regex = /\/(\d+)\/([^/?]*$)/g;
		return results
			.map(({ title, url }) => {
				const result = regex.exec(url);
				if (!result) return;

				const { 1: id, 2: slug } = result;
				const name = title.split("Reviews").at(0)!.trim();
				return { id, slug, name, url };
			})
			.filter((item): item is NonNullable<typeof item> => !!item);
	}

	async getReviewsByIdAndSlug({ id, slug }: Id & Slug) {
		const url = `${ReviewsApi.BASE_URL}/game/${id}/${slug}`;
		const $ = await this.static.loadUrl({ url });

		const title = $("app-game-overview h1").first().text();
		const image = $("app-game-overview .top-container img").first().attr("src");
		const [date] = $(".platforms").text().split("-");
		const display = $("app-tier-display").first().find("img");
		const tier = display.attr("data-cfsrc") ?? display.attr("src");
		const score = $("app-score-orb").first().text().trim();
		const recommended = $("app-score-orb").last().text().trim();
		const count = $("app-rapid-review-list a").first().text().match(/\d+/g)?.[0];
		const platforms = $(".platforms span")
			.map((_, element) => $(element).find("strong").text())
			.toArray();

		return {
			id,
			title,
			slug,
			url,
			tier: tier ? (tier.startsWith("http") ? tier : `https:${tier}`) : null,
			releaseDate: date.trim() ? new Date(date) : null,
			image: image ? (image.startsWith("http") ? image : `https:${image}`) : null,
			count: count || null,
			score: score || null,
			recommended: recommended || null,
			platforms: platforms.sort((a, b) => a.localeCompare(b)).map((name) => `> ${name}`),
		};
	}
}
