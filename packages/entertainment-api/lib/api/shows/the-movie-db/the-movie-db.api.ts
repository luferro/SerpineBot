import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';

import { getProvidersData } from './the-movie-db.scraper';

type ShowType = 'movie' | 'tv';

type Search = { results: { id: number }[] };

type Movie = {
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
};

type Series = {
	name: string;
	tagline: string;
	overview: string;
	homepage: string;
	status: string;
	first_air_date: string;
	next_episode_to_air?: { air_date: string } | string;
	seasons: { name: string; episode_count: number; air_date: string }[];
	poster_path: string;
	vote_average: number;
	vote_count: number;
	episode_run_time: number[];
	genres: { name: string }[];
};

type Providers = {
	results: {
		PT?: {
			link: string;
			flatrate?: { provider_name: string }[];
			rent?: { provider_name: string }[];
			buy?: { provider_name: string }[];
		};
	};
};

const getApiKey = () => {
	if (!process.env.THE_MOVIE_DB_API_KEY) throw new Error('THE_MOVIE_DB_API_KEY is not set.');
	return process.env.THE_MOVIE_DB_API_KEY;
};

export const search = async (type: ShowType, query: string) => {
	const url = `https://api.themoviedb.org/3/search/${type}?query=${query}&api_key=${getApiKey()}`;
	const { payload } = await FetchUtil.fetch<Search>({ url });
	return { id: payload.results[0]?.id.toString() ?? null };
};

export const getMovieById = async (id: string) => {
	const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${getApiKey()}`;
	const { payload } = await FetchUtil.fetch<Movie>({ url });

	return {
		name: payload.title,
		description: `${payload.tagline ? `*${payload.tagline}*` : ''}\n${
			payload.overview ? payload.overview : ''
		}`.trim(),
		url: payload.homepage || null,
		releaseDate: payload.release_date,
		image: payload.poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${payload.poster_path}` : null,
		score: payload.vote_count > 0 && payload.vote_average > 0 ? `${payload.vote_average.toFixed(1)}/10` : null,
		runtime: payload.runtime > 0 ? ConverterUtil.formatTime(payload.runtime * 1000 * 60) : null,
		genres: payload.genres.map(({ name }) => `> ${name}`),
	};
};

export const getSeriesById = async (id: string) => {
	const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${getApiKey()}`;
	const { payload } = await FetchUtil.fetch<Series>({ url });

	return {
		name: payload.name,
		status: payload.status,
		description: `${payload.tagline ? `*${payload.tagline}*` : ''}\n${payload.overview ? payload.overview : ''}`,
		url: payload.homepage || null,
		firstEpisode: payload.first_air_date,
		runtime:
			payload.episode_run_time.length > 0
				? ConverterUtil.formatTime(payload.episode_run_time[0] * 1000 * 60)
				: null,
		nextEpisode:
			payload.next_episode_to_air instanceof Object
				? payload.next_episode_to_air.air_date
				: payload.next_episode_to_air ?? null,
		seasons: payload.seasons.length,
		image: payload.poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${payload.poster_path}` : null,
		score: payload.vote_count > 0 && payload.vote_average > 0 ? `${payload.vote_average.toFixed(1)}/10` : null,
		genres: payload.genres.map(({ name }) => `> ${name}`),
	};
};

export const getProvidersForId = async (type: ShowType, id: string) => {
	const url = `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${getApiKey()}`;
	const {
		payload: {
			results: { PT },
		},
	} = await FetchUtil.fetch<Providers>({ url });

	const ptUrl = PT?.link ?? null;
	const providers = ptUrl ? await getProvidersData(ptUrl) : [];
	const buy = providers.filter(({ type }) => type === 'Buy');
	const rent = providers.filter(({ type }) => type === 'Rent');
	const stream = providers.filter(({ type }) => type === 'Stream');

	return { url: ptUrl, buy, rent, stream };
};

export const getCatalogMatches = async (type: ShowType, query: string) => {
	const { id } = await search(type, query);
	if (!id) return [];

	const { stream } = await getProvidersForId(type, id);
	return stream
		.sort((a, b) => a.provider.localeCompare(b.provider))
		.map(({ provider, entry }) => ({ provider, entry }));
};
