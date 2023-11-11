import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import type { Country as CountryEnum } from '../types/country';

type Payload<T> = { totalArticles: number; articles: T };

type Country = { country: CountryEnum };

type Article = {
	title: string;
	description: string;
	content: string;
	url: string;
	image: string;
	publishedAt: string;
	source: { name: string; url: string };
};

export class NewsApi {
	private apiKey: string;

	constructor({ apiKey }: { apiKey: string }) {
		this.apiKey = apiKey;
	}

	private async getArticles({ country }: Partial<Country>) {
		const url = [`https://gnews.io/api/v4/top-headlines?token=${this.apiKey}&topic=breaking-news&lang=en&max=100`];
		if (country) url.push(`&country=${country}`);

		const { payload } = await FetchUtil.fetch<Payload<Article[]>>({ url: url.join('') });
		return payload.articles
			.map(({ title, description, content, url, image, publishedAt, source }) => ({
				country,
				url,
				image,
				title: StringUtil.truncate(title),
				description: content ?? description,
				publishedAt: new Date(publishedAt),
				publisher: { name: source.name, url: source.url },
			}))
			.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
	}

	async getNews() {
		return await this.getArticles({});
	}

	async getNewsByCountry({ country }: Country) {
		return await this.getArticles({ country });
	}
}
