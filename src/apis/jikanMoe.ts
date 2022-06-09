import { fetch } from '../utils/fetch';
import { Anime } from '../types/responses';

export const getAnimeById = async (id: string) => {
	const {
		data: {
			title,
			title_english,
			url,
			season,
			year,
			status,
			score,
			episodes,
			duration,
			broadcast,
			trailer,
			images,
		},
	} = await fetch<Anime>({ url: `https://api.jikan.moe/v4/anime/${id}` });

	return {
		id,
		url,
		season,
		year,
		status,
		score,
		episodes,
		duration,
		trailer,
		title: {
			romaji: title,
			english: title_english,
		},
		broadcast: broadcast.string,
		image: images.jpg.large_image_url,
	};
};
