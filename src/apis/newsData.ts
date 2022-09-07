import { fetch } from '../utils/fetch';
import * as StringUtil from '../utils/string';
import { Article, Results } from '../types/responses';

const getPortugalNews = async () => {
	const { articles } = await fetch<Results<Article>>({
		url: `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_DATA_API_KEY}&country=pt `,
	});

	return articles;
};

const getWorldNews = async () => {
	const { articles } = await fetch<Results<Article>>({
		url: `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_DATA_API_KEY}&language=en&category=world `,
	});

	return articles;
};

export const getLatestArticles = async (limit = 10) => {
	const portugalNews = await getPortugalNews();
	const worldNews = await getWorldNews();

	return [...portugalNews, ...worldNews]
		.map(({ source_id, title, link, content, description, image_url, pubDate }) => ({
			title: StringUtil.truncate(title),
			url: link,
			publisher: source_id,
			publishedAt: new Date(pubDate),
			description: content ? StringUtil.truncate(content, 500) : description,
			image: image_url?.startsWith('http') ? image_url : null,
		}))
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, limit);
};
