import { fetch } from '../services/fetch';
import { Anime } from '../types/responses';

export const getAnimeById = async (id: string) => {
	const data = await fetch<Anime>(`https://api.jikan.moe/v4/anime/${id}`);
	const {
		title,
		title_english,
		url,
		season,
		year,
		status,
		score,
		episodes,
		duration,
		broadcast: { string: broadcastSchedule },
		trailer: { url: trailerUrl },
		images: {
			jpg: { large_image_url },
		},
	} = data.data;

	return {
		id,
		url,
		season,
		year,
		status,
		score,
		episodes,
		duration,
		title: {
			romaji: title,
			english: title_english,
		},
		broadcast: broadcastSchedule,
		image: large_image_url,
		trailer: trailerUrl,
	};
};
