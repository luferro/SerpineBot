import { ExtendedRESTDataSource } from "@luferro/graphql/server";

import type { MetacriticReview, OpencriticReview } from "./dtos/ReviewsApiDtos.js";

export class ReviewsDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://www.metacritic.com";

	private getAggregator(url: string) {
		return url.includes("metacritic") ? "metacritic" : "opencritic";
	}

	private getTier(ratingValue: number) {
		if (ratingValue >= 84) return "https://img.opencritic.com/mighty-man/mighty-man.png";
		if (ratingValue >= 75) return "https://img.opencritic.com/mighty-man/strong-man.png";
		if (ratingValue >= 65) return "https://img.opencritic.com/mighty-man/fair-man.png";
		return "https://img.opencritic.com/mighty-man/weak-man.png";
	}

	private async loadMetacriticUrl(url: string) {
		const $ = await this.loadUrl(url);
		const script = $('script[data-hid="ld+json"]').first().text();
		const { name, datePublished, description, image, aggregateRating, genre, gamePlatform, publisher } = JSON.parse(
			script,
		) as MetacriticReview;

		const developers = $(".c-gameDetails_Developer ul li")
			.get()
			.map((element) => $(element).text().trim());

		return {
			url,
			description,
			developers,
			image: image ? (image.includes("resize") ? image.replace(/\/resize\/[^/]+/, "").split("?")[0] : image) : null,
			publishers: publisher?.map((publisher) => publisher.name) ?? [],
			title: name,
			platforms: gamePlatform,
			genres: genre.split(" "),
			releaseDate: new Date(datePublished).getTime(),
			aggregateRating: aggregateRating
				? {
						tier: this.getTier(aggregateRating.ratingValue),
						ratingValue: aggregateRating.ratingValue,
						reviewCount: aggregateRating.reviewCount,
					}
				: null,
		};
	}

	private async loadOpencriticUrl(url: string) {
		const $ = await this.loadUrl(url);
		const script = $('script[type="application/ld+json"]').first().text();
		const { name, datePublished, description, image, aggregateRating, genre, gamePlatform, author, publisher } =
			JSON.parse(script) as OpencriticReview;

		return {
			url,
			image,
			description,
			title: name,
			genres: genre,
			platforms: gamePlatform,
			developers: author?.map((author) => author.name) ?? [],
			publishers: publisher?.map((publisher) => publisher.name) ?? [],
			releaseDate: new Date(datePublished).getTime(),
			aggregateRating: aggregateRating
				? {
						tier: this.getTier(aggregateRating.ratingValue),
						ratingValue: aggregateRating.ratingValue,
						reviewCount: aggregateRating.reviewCount,
					}
				: null,
		};
	}

	async search(query: string) {
		const $ = await this.loadUrl(`search/${query}?category=13`);

		return $(".c-pageSiteSearch-results-item")
			.get()
			.reduce<{ title: string; url: string; image?: string; score: number }[]>((acc, element) => {
				const type = $(element).find("span").first().text();
				if (type !== "game") return acc;

				const title = $(element).find("p").first().text().trim();
				const url = this.baseURL.concat($(element).attr("href")!);
				const score = Number($(element).find("span").last().text().trim());
				acc.push({ title, url, score: !Number.isNaN(score) ? score : -1 });
				return acc;
			}, []);
	}

	async loadReviewUrl(url: string) {
		const aggregator = this.getAggregator(url);
		const loader = aggregator === "metacritic" ? this.loadMetacriticUrl : this.loadOpencriticUrl;
		return await loader.bind(this)(url);
	}
}
