import type { ProviderCategory, TheMovieDbCategory } from '../types/category';
import type { MovieResponse, ProvidersResponse, SearchResponse, SeriesResponse } from '../types/response';
import { FetchUtil, ConverterUtil, UrlUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

export const search = async (title: string, category: TheMovieDbCategory) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const searchType = category === 'Movies' ? 'movie' : 'tv';
	const data = await FetchUtil.fetch<SearchResponse>({
		url: `https://api.themoviedb.org/3/search/${searchType}?query=${title}&api_key=${API_KEY}`,
	});

	return { id: data.results[0]?.id.toString() ?? null };
};

export const getMovieById = async (id: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const { title, tagline, overview, homepage, release_date, poster_path, vote_average, vote_count, runtime, genres } =
		await FetchUtil.fetch<MovieResponse>({ url: `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}` });

	return {
		name: title,
		description: `${tagline ? `*${tagline}*` : ''}\n${overview ? overview : ''}`.trim(),
		url: homepage || null,
		releaseDate: release_date,
		image: poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null,
		score: vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null,
		runtime: runtime > 0 ? (ConverterUtil.toHours(runtime * 1000 * 60, true) as string) : null,
		genres: genres.map(({ name }) => `> ${name}`),
	};
};

export const getSeriesById = async (id: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

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
	} = await FetchUtil.fetch<SeriesResponse>({ url: `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}` });

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
		runtime:
			episode_run_time.length > 0
				? (ConverterUtil.toHours(episode_run_time[0] * 1000 * 60, true) as string)
				: null,
		genres: genres.map(({ name }) => `> ${name}`),
	};
};

const getProvidersWithLinks = async (url: string) => {
	const data = await FetchUtil.fetch<string>({ url });
	const $ = load(data);

	const array = [];
	for (const element of $('.ott_provider').get()) {
		const type = $(element).find('h3').text() as ProviderCategory;

		const providers = $(element)
			.find('ul.providers li')
			.get()
			.filter((row) => !$(row).hasClass('hide'));

		for (const provider of providers) {
			const anchor = $(provider).find('a');

			const url = anchor.attr('href');
			const title = anchor.attr('title');
			const match = title?.match(/^\w+ (.*) on (.*)$/);
			if (!match || !url) continue;

			const { 1: entryName, 2: subscriptionName } = match;
			const destinationUrl = await UrlUtil.getRedirectLocation(url);

			array.push({
				type,
				name: subscriptionName,
				entry: {
					name: entryName,
					url: destinationUrl,
				},
			});
		}
	}

	return array;
};

export const getProviders = async (id: string, category: TheMovieDbCategory) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const searchType = category === 'Movies' ? 'movie' : 'tv';
	const {
		results: { PT },
	} = await FetchUtil.fetch<ProvidersResponse>({
		url: `https://api.themoviedb.org/3/${searchType}/${id}/watch/providers?api_key=${API_KEY}`,
	});

	const url = PT?.link ?? null;
	const providers = url ? await getProvidersWithLinks(url) : [];
	const buy = providers.filter(({ type }) => type === 'Buy');
	const rent = providers.filter(({ type }) => type === 'Rent');
	const stream = providers.filter(({ type }) => type === 'Stream');

	return { url, buy, rent, stream };
};
