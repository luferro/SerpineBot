import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';

import { Id, Query } from '../../../types/args';
import { getProvidersData } from './tmdb.scraper';

type ShowType = 'movie' | 'tv';

type SearchResult = { results: { id: number; media_type: ShowType }[] };

type Providers = {
	results: {
		[key: string]: {
			link: string;
			flatrate?: { provider_name: string }[];
			rent?: { provider_name: string }[];
			buy?: { provider_name: string }[];
		};
	};
};

type Movie = {
	'title': string;
	'tagline': string;
	'overview': string;
	'homepage': string;
	'release_date': string;
	'poster_path': string;
	'vote_average': number;
	'vote_count': number;
	'runtime': number;
	'genres': { name: string }[];
	'watch/providers': Providers;
};

type Series = {
	'name': string;
	'tagline': string;
	'overview': string;
	'homepage': string;
	'status': string;
	'first_air_date': string;
	'next_episode_to_air'?: { air_date: string } | string;
	'seasons': { name: string; episode_count: number; air_date: string }[];
	'poster_path': string;
	'vote_average': number;
	'vote_count': number;
	'episode_run_time': number[];
	'genres': { name: string }[];
	'watch/providers': Providers;
};

const getApiKey = () => {
	if (!process.env.THE_MOVIE_DB_API_KEY) throw new Error('THE_MOVIE_DB_API_KEY is not set.');
	return process.env.THE_MOVIE_DB_API_KEY;
};

export const search = async ({ query }: Query) => {
	const { payload } = await FetchUtil.fetch<SearchResult>({
		url: `https://api.themoviedb.org/3/search/multi?api_key=${getApiKey()}&query=${query}`,
	});
	const results = payload.results.filter(({ media_type }) => media_type === 'movie' || media_type === 'tv');
	return {
		id: results[0]?.id.toString() ?? null,
		type: results[0]?.media_type ?? null,
	};
};

export const getMovieById = async ({ id }: Id) => {
	const { payload } = await FetchUtil.fetch<Movie>({
		url: `https://api.themoviedb.org/3/movie/${id}?api_key=${getApiKey()}&append_to_response=watch/providers`,
	});

	const { tagline, overview, runtime: _runtime, poster_path, vote_count, vote_average } = payload;
	const description = `${tagline ? `*${tagline}*` : ''}\n${overview ?? ''}`.trim();
	const runtime = _runtime > 0 ? ConverterUtil.formatTime(_runtime * 1000 * 60) : null;
	const image = poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null;
	const score = vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null;

	const { link } = payload['watch/providers'].results[(process.env.LOCALE ?? 'en-US').split('-')[1]];
	const providers = link ? await getProvidersData({ url: link }) : [];

	return {
		description,
		image,
		score,
		runtime,
		name: payload.title,
		url: payload.homepage || null,
		releaseDate: payload.release_date,
		genres: payload.genres.map(({ name }) => `> ${name}`),
		providers: {
			url: link,
			buy: providers.filter(({ type }) => type === 'Buy'),
			rent: providers.filter(({ type }) => type === 'Rent'),
			stream: providers.filter(({ type }) => type === 'Stream'),
		},
	};
};

export const getSeriesById = async ({ id }: Id) => {
	const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${getApiKey()}&append_to_response=watch/providers`;
	const { payload } = await FetchUtil.fetch<Series>({ url });

	const { tagline, overview, episode_run_time, next_episode_to_air, poster_path, vote_count, vote_average } = payload;
	const description = `${tagline ? `*${tagline}*` : ''}\n${overview ?? ''}`.trim();
	const image = poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null;
	const runtime = episode_run_time.length > 0 ? ConverterUtil.formatTime(episode_run_time[0] * 1000 * 60) : null;
	const nextEpisode = next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air;
	const score = vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null;

	const { link } = payload['watch/providers'].results[(process.env.LOCALE ?? 'en-US').split('-')[1]];
	const providers = link ? await getProvidersData({ url: link }) : [];

	return {
		description,
		runtime,
		score,
		image,
		name: payload.name,
		status: payload.status,
		url: payload.homepage || null,
		firstEpisode: payload.first_air_date,
		nextEpisode: nextEpisode ?? null,
		seasons: payload.seasons.length,
		genres: payload.genres.map(({ name }) => `> ${name}`),
		providers: {
			url: link,
			buy: providers.filter(({ type }) => type === 'Buy'),
			rent: providers.filter(({ type }) => type === 'Rent'),
			stream: providers.filter(({ type }) => type === 'Stream'),
		},
	};
};

export const getStreamingServices = async ({ query }: Query) => {
	const { id, type } = await search({ query });
	if (!id) return [];

	const { providers } = type === 'tv' ? await getSeriesById({ id }) : await getMovieById({ id });
	return providers.stream
		.sort((a, b) => a.provider.localeCompare(b.provider))
		.map(({ provider, entry }) => ({ provider, entry }));
};
