export interface JikanPayload {
	data: {
		mal_id: number;
		title: string;
		title_english: string | null;
		url: string;
		season: string;
		year: number;
		broadcast: {
			day: string | null;
			time: string | null;
			timezone: string | null;
			string: string | null;
		};
		status: string;
		score: number;
		episodes: number;
		duration: string;
		images: {
			jpg: {
				large_image_url: string | null;
			};
		};
		trailer: {
			url: string | null;
		};
	};
}

export interface TMDBSearchPayload {
	results: { id: number }[];
}

export interface TMDBMoviePayload {
	title: string;
	tagline: string;
	overview: string;
	homepage: string;
	release_date: string;
	poster_path: string;
	vote_average: number;
	vote_count: number;
	runtime: number;
	genres: { name: string }[];
}

export interface TMDBSeriesPayload {
	name: string;
	tagline: string;
	overview: string;
	homepage: string;
	status: string;
	first_air_date: string;
	next_episode_to_air?: { air_date: string } | string;
	seasons: {
		name: string;
		episode_count: number;
		air_date: string;
	}[];
	poster_path: string;
	vote_average: number;
	vote_count: number;
	episode_run_time: number[];
	genres: { name: string }[];
}

export interface TMDBProvidersPayload {
	results: {
		PT?: {
			link: string;
			flatrate?: { provider_name: string }[];
			rent?: { provider_name: string }[];
			buy?: { provider_name: string }[];
		};
	};
}
