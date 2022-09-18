interface SearchResult {
	id: number;
}

export interface SearchResponse {
	results: SearchResult[];
}

interface Genres {
	name: string;
}

export interface MovieResponse {
	title: string;
	tagline: string;
	overview: string;
	homepage: string;
	release_date: string;
	poster_path: string;
	vote_average: number;
	vote_count: number;
	runtime: number;
	genres: Genres[];
}

interface Season {
	name: string;
	episode_count: number;
	air_date: string;
}

export interface SeriesResponse {
	name: string;
	tagline: string;
	overview: string;
	homepage: string;
	status: string;
	first_air_date: string;
	next_episode_to_air?: { air_date: string } | string;
	seasons: Season[];
	poster_path: string;
	vote_average: number;
	vote_count: number;
	episode_run_time: number[];
	genres: Genres[];
}

interface ProviderDetails {
	provider_name: string;
}

interface Provider {
	link: string;
	flatrate?: ProviderDetails[];
	rent?: ProviderDetails[];
	buy?: ProviderDetails[];
}

export interface ProvidersResponse {
	results: {
		PT?: Provider;
	};
}
