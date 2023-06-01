import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import type { Country } from '../types/country';

type Payload<T> = { totalArticles: number; articles: T };

type Article = {
	title: string;
	description: string;
	content: string;
	url: string;
	image: string;
	publishedAt: string;
	source: { name: string; url: string };
};

let API_KEY: string | null = null;

export const setApiKey = (apiKey: string) => (API_KEY = apiKey);

export const getNews = async () => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&lang=en&max=100`;
	return await getNewsList(url);
};

export const getNewsByCountry = async (country: Country) => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=breaking-news&country=${country}&max=100`;
	return await getNewsList(url, country);
};

const getNewsList = async (url: string, country?: Country) => {
	const { payload } = await FetchUtil.fetch<Payload<Article[]>>({ url });
	return payload.articles.map(({ title, description, content, url, image, publishedAt, source }) => ({
		country,
		url,
		image,
		title: StringUtil.truncate(title),
		description: content ?? description,
		publishedAt: new Date(publishedAt),
		publisher: { name: source.name, url: source.url },
	}));
};
