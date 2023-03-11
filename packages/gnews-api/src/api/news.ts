import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import type { Country } from '../types/news';
import type { Article, NewsResponse } from '../types/response';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

const extractRelevantDataFromResults = async (country: Country | null, articles: Article[]) => {
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

export const getNewsByCountry = async (country: Country) => {
	const { articles } = await FetchUtil.fetch<NewsResponse<Article>>({
		url: `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&country=${country}&max=100`,
	});

	return extractRelevantDataFromResults(country, articles);
};

export const getBreakingNews = async () => {
	const { articles } = await FetchUtil.fetch<NewsResponse<Article>>({
		url: `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&lang=en&max=100`,
	});

	return extractRelevantDataFromResults(null, articles);
};
