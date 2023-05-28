import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import type { Country } from '../types/country';
import type { Article, NewsPayload } from '../types/payload';

let API_KEY: string | null = null;

export const setApiKey = (apiKey: string) => (API_KEY = apiKey);

export const getNews = async () => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&lang=en&max=100`;
	const { articles } = await FetchUtil.fetch<NewsPayload<Article>>({ url });
	return extract(null, articles);
};

export const getNewsByCountry = async (country: Country) => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&country=${country}&max=100`;
	const { articles } = await FetchUtil.fetch<NewsPayload<Article>>({ url });
	return extract(country, articles);
};

const extract = (country: Country | null, articles: Article[]) => {
	return articles.map(({ title, description, content, url, image, publishedAt, source }) => ({
		country,
		url,
		image,
		title: StringUtil.truncate(title),
		description: content ?? description,
		publishedAt: new Date(publishedAt),
		publisher: {
			name: source.name,
			url: source.url,
		},
	}));
};
