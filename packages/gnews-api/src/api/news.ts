import type { Country } from '../types/news';
import type { Article, NewsResponse } from '../types/response';
import { FetchUtil, StringUtil } from '@luferro/shared-utils';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

const extractRelevantDataFromResults = async (articles: Article[]) => {
	return articles.map(({ title, description, content, url, image, publishedAt, source }) => ({
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

	return extractRelevantDataFromResults(articles);
};

export const getBreakingNews = async () => {
	const { articles } = await FetchUtil.fetch<NewsResponse<Article>>({
		url: `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&lang=en&max=100`,
	});

	return extractRelevantDataFromResults(articles);
};
