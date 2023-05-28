import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';

import { TMDBMoviePayload, TMDBProvidersPayload, TMDBSearchPayload, TMDBSeriesPayload } from '../../types/payload';
import { getProviders } from './the-movie-db.scraper';

type ShowType = 'movie' | 'tv';

let API_KEY: string | null = null;

const validateApiKey = () => {
	if (!API_KEY) throw new Error('TheMovieDB API key is not set.');
};

export const setApiKey = (apiKey: string) => (API_KEY = apiKey);

export const search = async (type: ShowType, query: string) => {
	validateApiKey();
	const url = `https://api.themoviedb.org/3/search/${type}?query=${query}&api_key=${API_KEY}`;
	const data = await FetchUtil.fetch<TMDBSearchPayload>({ url });
	const id = data.results[0]?.id.toString() ?? null;
	return { id };
};

export const getShowById = async (type: ShowType, id: string) => {
	validateApiKey();

	const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`;

	if (type === 'movie') {
		const {
			title,
			tagline,
			overview,
			homepage,
			release_date,
			poster_path,
			vote_average,
			vote_count,
			runtime,
			genres,
		} = await FetchUtil.fetch<TMDBMoviePayload>({ url });

		return {
			name: title,
			description: `${tagline ? `*${tagline}*` : ''}\n${overview ? overview : ''}`.trim(),
			url: homepage || null,
			releaseDate: release_date,
			image: poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null,
			score: vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null,
			runtime: runtime > 0 ? ConverterUtil.toHoursFormatted(runtime * 1000 * 60) : null,
			genres: genres.map(({ name }) => `> ${name}`),
		};
	}

	const {
		name,
		tagline,
		overview,
		homepage,
		status,
		first_air_date,
		next_episode_to_air,
		seasons,
		poster_path,
		vote_average,
		vote_count,
		episode_run_time,
		genres,
	} = await FetchUtil.fetch<TMDBSeriesPayload>({ url });

	return {
		name,
		status,
		description: `${tagline ? `*${tagline}*` : ''}\n${overview ? overview : ''}`,
		url: homepage || null,
		firstEpisode: first_air_date,
		nextEpisode: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air ?? null,
		seasons: seasons.length,
		image: poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null,
		score: vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null,
		runtime: episode_run_time.length > 0 ? ConverterUtil.toHoursFormatted(episode_run_time[0] * 1000 * 60) : null,
		genres: genres.map(({ name }) => `> ${name}`),
	};
};

export const getProvidersForId = async (type: ShowType, id: string) => {
	validateApiKey();
	const url = `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${API_KEY}`;
	const {
		results: { PT },
	} = await FetchUtil.fetch<TMDBProvidersPayload>({ url });

	const ptUrl = PT?.link ?? null;
	const providers = url ? await getProviders(url) : [];
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
