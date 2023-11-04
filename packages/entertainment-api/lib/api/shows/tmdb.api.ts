import { ConverterUtil, DateUtil, FetchUtil } from '@luferro/shared-utils';

import { Id, Query } from '../../types/args';

type Payload<T> = { results: T };

type Result = {
	id: number;
	title: string;
	name: string;
	media_type: 'movie' | 'tv' | 'person';
	poster_path: string | null;
};

type BaseEntry = {
	'id': number;
	'tagline': string;
	'overview': string;
	'homepage': string;
	'poster_path': string;
	'vote_average': number;
	'vote_count': number;
	'genres': { name: string }[];
	'watch/providers': Payload<{
		[key: string]: {
			link: string;
			flatrate?: { provider_name: string }[];
			rent?: { provider_name: string }[];
			buy?: { provider_name: string }[];
		};
	}>;
};

type Movie = BaseEntry & {
	title: string;
	release_date: string;
	runtime: number;
	genres: { name: string }[];
};

type Series = BaseEntry & {
	name: string;
	status: string;
	number_of_episodes: number;
	number_of_seasons: number;
	last_episode_to_air: { episode_number: number; air_date: string };
	next_episode_to_air?: { episode_number: number; air_date: string } | string;
	episode_run_time: number[];
};

const getApiKey = () => {
	if (!process.env.THE_MOVIE_DB_API_KEY) throw new Error('THE_MOVIE_DB_API_KEY is not set.');
	return process.env.THE_MOVIE_DB_API_KEY;
};

export const search = async ({ query }: Query) => {
	const { payload } = await FetchUtil.fetch<Payload<Result[]>>({
		url: `https://api.themoviedb.org/3/search/multi?api_key=${getApiKey()}&query=${query}`,
	});

	return payload.results
		.filter(({ media_type, poster_path }) => media_type !== 'person' && !!poster_path)
		.map(({ id, title, name, media_type }) => ({
			id,
			title: media_type === 'movie' ? title : name,
			type: media_type,
		}));
};

export const getMovieById = async ({ id }: Id) => {
	const { payload } = await FetchUtil.fetch<Movie>({
		url: `https://api.themoviedb.org/3/movie/${id}?api_key=${getApiKey()}&append_to_response=watch/providers`,
	});

	const { tagline, overview } = payload;
	const localeProviders = payload['watch/providers'].results[DateUtil.getDefaultLocale().code.toUpperCase()];

	return {
		tagline,
		overview,
		image: payload.poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${payload.poster_path}` : null,
		score: payload.vote_count > 0 && payload.vote_average > 0 ? `${payload.vote_average.toFixed(1)}/10` : null,
		duration: payload.runtime > 0 ? ConverterUtil.formatTime(payload.runtime * 1000 * 60) : null,
		name: payload.title,
		url: localeProviders?.link || payload.homepage || null,
		releaseDate: payload.release_date,
		genres: payload.genres,
		providers: {
			buy: localeProviders?.buy?.map((provider) => provider.provider_name) ?? [],
			rent: localeProviders?.rent?.map((provider) => provider.provider_name) ?? [],
			stream: localeProviders?.flatrate?.map((provider) => provider.provider_name) ?? [],
		},
	};
};

export const getSeriesById = async ({ id }: Id) => {
	const { payload } = await FetchUtil.fetch<Series>({
		url: `https://api.themoviedb.org/3/tv/${id}?api_key=${getApiKey()}&append_to_response=watch/providers`,
	});

	const { name, tagline, overview, episode_run_time, next_episode_to_air, last_episode_to_air } = payload;
	const localeProviders = payload['watch/providers'].results[DateUtil.getDefaultLocale().code.toUpperCase()];

	return {
		name,
		tagline,
		overview,
		score: payload.vote_count > 0 && payload.vote_average > 0 ? `${payload.vote_average.toFixed(1)}/10` : null,
		image: payload.poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${payload.poster_path}` : null,
		url: localeProviders?.link || payload.homepage || null,
		genres: payload.genres,
		seasons: payload.number_of_seasons,
		episodes: {
			total: payload.number_of_episodes,
			duration: episode_run_time.length > 0 ? ConverterUtil.formatTime(episode_run_time[0] * 1000 * 60) : null,
			next: { date: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air },
			last: { date: last_episode_to_air.air_date },
		},
		providers: {
			buy: localeProviders?.buy?.map((provider) => provider.provider_name) ?? [],
			rent: localeProviders?.rent?.map((provider) => provider.provider_name) ?? [],
			stream: localeProviders?.flatrate?.map((provider) => provider.provider_name) ?? [],
		},
	};
};
