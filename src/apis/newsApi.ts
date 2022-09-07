import { fetch } from '../utils/fetch';
import { Article, Results } from '../types/responses';

const getNationalNews = async () => {
	const { articles } = await fetch<Results<Article>>({
		url: `https://newsapi.org/v2/top-headlines?country=pt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	});

	return articles;
};

const getInternationalNews = async () => {
	const { articles } = await fetch<Results<Article>>({
		url: `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
	});

	return articles;
};

export const getLatestArticles = async (limit = 10) => {
	const nationalNews = await getNationalNews();
	const internationalNews = await getInternationalNews();

	return [...nationalNews, ...internationalNews]
		.map(({ title, url, author, description, content, source, urlToImage, publishedAt }) => ({
			title,
			url,
			publishedAt,
			author: source.name ?? author,
			description: content ?? description,
			image: urlToImage?.startsWith('http') ? urlToImage : null,
		}))
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, limit);
};
