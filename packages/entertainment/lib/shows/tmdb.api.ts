import { ConverterUtil, FetchUtil } from "@luferro/shared-utils";
import type { Movie, Payload, Result, Series } from "./tmdb.types";

export class TMDBApi {
	constructor(private apiKey: string) {}

	async search(query: string) {
		const { payload } = await FetchUtil.fetch<Payload<Result[]>>(
			`https://api.themoviedb.org/3/search/multi?api_key=${this.apiKey}&query=${query}`,
		);

		return payload.results
			.filter(({ poster_path, media_type }) => media_type !== "person" && !!poster_path)
			.map(({ id, title, name, media_type }) => ({ id, title: title ?? name, type: media_type }));
	}

	async getMovieById(id: string, { locale = "pt-PT" } = {}) {
		const { payload } = await FetchUtil.fetch<Movie>(
			`https://api.themoviedb.org/3/movie/${id}?api_key=${this.apiKey}&append_to_response=watch/providers`,
		);

		const { tagline, overview } = payload;
		const localeProviders = payload["watch/providers"].results[locale.split("-")[1]];

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
	}

	async getSeriesById(id: string, { locale = "pt-PT" } = {}) {
		const { payload } = await FetchUtil.fetch<Series>(
			`https://api.themoviedb.org/3/tv/${id}?api_key=${this.apiKey}&append_to_response=watch/providers`,
		);

		const { name, tagline, overview, episode_run_time, next_episode_to_air, last_episode_to_air } = payload;
		const localeProviders = payload["watch/providers"].results[locale.split("-")[1]];

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
				next: {
					date: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air,
				},
				last: { date: last_episode_to_air.air_date },
			},
			providers: {
				buy: localeProviders?.buy?.map((provider) => provider.provider_name) ?? [],
				rent: localeProviders?.rent?.map((provider) => provider.provider_name) ?? [],
				stream: localeProviders?.flatrate?.map((provider) => provider.provider_name) ?? [],
			},
		};
	}
}
