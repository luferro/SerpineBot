import { fetch } from '../services/fetch';
import { Gif, Results } from '../types/responses';

export const search = async (title: string) => {
	const { results } = await fetch<Results<Gif>>(
		`https://g.tenor.com/v1/search?q=${title}&key=${process.env.TENOR_API_KEY}&limit=50`,
	);

	return {
		gif: results[Math.floor(Math.random() * results.length)].itemurl,
	};
};
