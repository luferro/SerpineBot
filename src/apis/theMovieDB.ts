import { fetch } from '../services/fetch';
import * as ConverterUtil from '../utils/converter';
import { TheMovieDBCategories } from '../types/categories';
import { Movie, Providers, Result, Results, TV } from '../types/responses';

export const search = async (title: string, category: TheMovieDBCategories) => {
	const data = await fetch<Results<Result>>(
		`https://api.themoviedb.org/3/search/${category}?query=${title}&api_key=${process.env.THEMOVIEDB_API_KEY}`,
	);
	return data.results[0]?.id.toString();
};

export const getMovieById = async (id: string) => {
	const data = await fetch<Movie>(
		`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`,
	);
	const { title, tagline, overview, homepage, release_date, poster_path, vote_average, runtime, genres } = data;

	return {
		name: title,
		tagline,
		overview,
		url: homepage,
		releaseDate: release_date,
		image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
		score: `${vote_average}/10`,
		runtime: ConverterUtil.minutesToHoursAndMinutes(runtime),
		genres: genres.map((item) => `> ${item.name}`),
	};
};

export const getTvShowById = async (id: string) => {
	const data = await fetch<TV>(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
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
	} = data;

	return {
		name,
		tagline,
		overview,
		status,
		url: homepage,
		firstEpisode: first_air_date,
		nextEpisode: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air,
		seasons: seasons.length,
		image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`,
		score: `${vote_average}/10`,
		runtime: ConverterUtil.minutesToHoursAndMinutes(episode_run_time[0]),
		genres: genres.map((item) => `> ${item.name}`),
	};
};

export const getProviders = async (id: string, category: TheMovieDBCategories) => {
	const data = await fetch<Providers>(
		`https://api.themoviedb.org/3/${category}/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`,
	);
	const { PT } = data.results;

	return {
		url: PT?.link,
		buy: PT?.buy?.map((item) => `> ${item.provider_name}`) ?? [],
		rent: PT?.rent?.map((item) => `> ${item.provider_name}`) ?? [],
		stream: PT?.flatrate?.map((item) => `> ${item.provider_name}`) ?? [],
	};
};
