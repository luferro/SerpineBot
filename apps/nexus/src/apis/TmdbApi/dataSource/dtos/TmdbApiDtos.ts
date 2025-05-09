export type Payload<T> = { results: T };

export type Result = {
	id: number;
	title: string;
	name: string;
	media_type: "movie" | "tv" | "person";
	poster_path: string | null;
};

type BaseEntry = {
	id: number;
	tagline: string;
	overview: string;
	homepage: string;
	poster_path: string;
	vote_average: number;
	vote_count: number;
	genres: { name: string }[];
	"watch/providers": Payload<{
		[key: string]: {
			link: string;
			flatrate?: { provider_name: string }[];
			rent?: { provider_name: string }[];
			buy?: { provider_name: string }[];
		};
	}>;
};

export type Movie = BaseEntry & {
	title: string;
	release_date: string;
	runtime: number;
	genres: { name: string }[];
};

export type Series = BaseEntry & {
	name: string;
	status: string;
	number_of_episodes: number;
	number_of_seasons: number;
	last_episode_to_air: { episode_number: number; air_date: string };
	next_episode_to_air?: { episode_number: number; air_date: string } | string;
	episode_run_time: number[];
};
