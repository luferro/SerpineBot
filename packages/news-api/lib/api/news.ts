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

const getApiKey = () => {
	if (!process.env.GNEWS_API_KEY) throw new Error('GNEWS_API_KEY is not set.');
	return process.env.GNEWS_API_KEY;
};

export const getNews = async () => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${getApiKey()}&topic=breaking-news&lang=en&max=100`;
	return await getNewsList(url);
};

export const getNewsByCountry = async (country: Country) => {
	const url = `https://gnews.io/api/v4/top-headlines?token=${getApiKey()}&topic=breaking-news&country=${country}&max=100`;
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
