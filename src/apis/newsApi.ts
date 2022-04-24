import { fetch } from '../services/fetch';
import { Article, Results } from '../types/responses';

const getNationalNews = async () => {
	const { articles } = await fetch<Results<Article>>(
		`https://newsapi.org/v2/top-headlines?country=pt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	);

	return articles;
};

const getInternationalNews = async () => {
	const { articles } = await fetch<Results<Article>>(
		`https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	);

	return articles;
};

export const getLatestArticles = async (limit = 10) => {
	return [...(await getNationalNews()), ...(await getInternationalNews())]
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, limit);
};
