import { fetch } from '../services/fetch';
import { Gif, Results } from '../types/responses';

export const search = async (title: string) => {
	const data = await fetch<Results<Gif>>(
		`https://g.tenor.com/v1/search?q=${title}&key=${process.env.TENOR_API_KEY}&limit=50`,
	);
	const randomGif = data.results[Math.floor(Math.random() * data.results.length)].itemurl;

	return {
		gif: randomGif,
	};
};
