import type { JikanResponse } from '../types/response';
import { FetchUtil } from '@luferro/shared-utils';

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
	} = await FetchUtil.fetch<JikanResponse>({ url: `https://api.jikan.moe/v4/anime/${id}` });

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
