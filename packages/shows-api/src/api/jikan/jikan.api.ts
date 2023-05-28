import { FetchUtil } from '@luferro/shared-utils';

import { JikanPayload } from '../../types/payload';

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
	} = await FetchUtil.fetch<JikanPayload>({ url: `https://api.jikan.moe/v4/anime/${id}` });

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
		title: { romaji: title, english: title_english },
		broadcast: broadcast.string,
		image: images.jpg.large_image_url,
	};
};
