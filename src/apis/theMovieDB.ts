import { fetch } from '../utils/fetch';
import * as ConverterUtil from '../utils/converter';
import { TheMovieDBCategories } from '../types/categories';
import { Movie, Providers, Result, Results, TV } from '../types/responses';

export const search = async (title: string, category: TheMovieDBCategories) => {
	const data = await fetch<Results<Result>>({
		url: `https://api.themoviedb.org/3/search/${category}?query=${title}&api_key=${process.env.THEMOVIEDB_API_KEY}`,
	});

	return data.results[0]?.id.toString();
};

export const getMovieById = async (id: string) => {
	const { title, tagline, overview, homepage, release_date, poster_path, vote_average, runtime, genres } =
		await fetch<Movie>({
			url: `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`,
		});

	return {
		name: title,
		description: `${tagline ? `*${tagline}*` : ''}\n${overview ? overview : ''}`,
		url: homepage,
		releaseDate: release_date,
		image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
		score: `${vote_average}/10`,
		runtime: ConverterUtil.minutesToHoursAndMinutes(runtime),
		genres: genres.map(({ name }) => `> ${name}`),
	};
};

export const getTvShowById = async (id: string) => {
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
		episode_run_time,
		genres,
	} = await fetch<TV>({ url: `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}` });

	return {
		name,
		status,
		description: `${tagline ? `*${tagline}*` : ''}\n${overview ? overview : ''}`,
		url: homepage,
		firstEpisode: first_air_date,
		nextEpisode: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air,
		seasons: seasons.length,
		image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
		score: `${vote_average}/10`,
		runtime: ConverterUtil.minutesToHoursAndMinutes(episode_run_time[0]),
		genres: genres.map(({ name }) => `> ${name}`),
	};
};

export const getProviders = async (id: string, category: TheMovieDBCategories) => {
	const {
		results: { PT },
	} = await fetch<Providers>({
		url: `https://api.themoviedb.org/3/${category}/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`,
	});

	return {
		url: PT?.link,
		buy: PT?.buy?.map(({ provider_name }) => `> ${provider_name}`) ?? [],
		rent: PT?.rent?.map(({ provider_name }) => `> ${provider_name}`) ?? [],
		stream: PT?.flatrate?.map(({ provider_name }) => `> ${provider_name}`) ?? [],
	};
};
