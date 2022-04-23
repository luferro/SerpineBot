import { fetch } from '../services/fetch';
import { Article, Results } from '../types/responses';

const getNationalNews = async () => {
	const data = await fetch<Results<Article>>(
		`https://newsapi.org/v2/top-headlines?country=pt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	);
	return data.articles;
};

const getInternationalNews = async () => {
	const data = await fetch<Results<Article>>(
		`https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	);
	return data.articles;
};

export const getLatestArticles = async (limit = 10) => {
	const nationalArticles = await getNationalNews();
	const internationalArticles = await getInternationalNews();

	const articles = nationalArticles.concat(internationalArticles);
	return articles
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, limit);
};
