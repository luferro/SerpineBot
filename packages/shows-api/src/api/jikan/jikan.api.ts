import { FetchUtil } from '@luferro/shared-utils';

type Payload<T> = { data: T };

type Anime = {
	mal_id: number;
	title: string;
	title_english: string | null;
	url: string;
	season: string;
	year: number;
	broadcast: { day: string | null; time: string | null; timezone: string | null; string: string | null };
	status: string;
	score: number;
	episodes: number;
	duration: string;
	images: { jpg: { large_image_url: string | null } };
	trailer: { url: string | null };
};

export const getAnimeById = async (id: string) => {
	const {
		payload: { data },
	} = await FetchUtil.fetch<Payload<Anime>>({ url: `https://api.jikan.moe/v4/anime/${id}` });

	return {
		id,
		url: data.url,
		season: data.season,
		year: data.year,
		status: data.status,
		score: data.score,
		episodes: data.episodes,
		duration: data.duration,
		trailer: data.trailer,
		title: { romaji: data.title, english: data.title_english },
		broadcast: data.broadcast.string,
		image: data.images.jpg.large_image_url,
	};
};
