import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import { formatDuration } from "@luferro/utils/time";

import type { TmdbMediaInput } from "~/model/schema.generated.js";
import type { Movie, Payload, Result, Series } from "./dtos/TmdbApiDtos.js";

export class TmdbDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://api.themoviedb.org/3/";
	protected readonly token: string;

	constructor({ token }: { token: string }) {
		super();
		this.token = token;
	}

	protected async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		request.headers.Authorization = this.token;
	}

	async search(query: string) {
		const data = await this.get<Payload<Result[]>>("search/multi", {
			params: { query },
		});

		return data.results
			.filter(({ poster_path, media_type }) => media_type !== "person" && !!poster_path)
			.map(({ id, title, name, media_type }) => ({ id: id.toString(), title: title ?? name, type: media_type }));
	}

	async getMovieById({ id, locale = "pt-PT" }: TmdbMediaInput) {
		const {
			title,
			homepage,
			tagline,
			overview,
			release_date,
			vote_average,
			vote_count,
			runtime,
			poster_path,
			genres,
			"watch/providers": providers,
		} = await this.get<Movie>(`movie/${id}`, {
			params: { append_to_response: "watch/providers" },
		});

		const localeProviders = providers.results[locale.split("-")[1]];

		return {
			id,
			title,
			tagline,
			overview,
			genres: genres.map((genre) => genre.name),
			image: poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null,
			score: vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null,
			duration: runtime > 0 ? formatDuration(runtime * 1000 * 60) : null,
			url: localeProviders?.link || homepage || null,
			releaseDate: release_date,
			providers: {
				buy: localeProviders?.buy?.map((provider) => provider.provider_name) ?? [],
				rent: localeProviders?.rent?.map((provider) => provider.provider_name) ?? [],
				stream: localeProviders?.flatrate?.map((provider) => provider.provider_name) ?? [],
			},
		};
	}

	async getSeriesById({ id, locale = "pt-PT" }: TmdbMediaInput) {
		const {
			name,
			homepage,
			tagline,
			overview,
			number_of_seasons,
			number_of_episodes,
			episode_run_time,
			next_episode_to_air,
			last_episode_to_air,
			vote_count,
			vote_average,
			poster_path,
			genres,
			"watch/providers": providers,
		} = await this.get<Series>(`tv/${id}`, { params: { append_to_response: "watch/providers" } });

		const localeProviders = providers.results[locale.split("-")[1]];

		return {
			id,
			tagline,
			overview,
			title: name,
			genres: genres.map((genre) => genre.name),
			score: vote_count > 0 && vote_average > 0 ? `${vote_average.toFixed(1)}/10` : null,
			image: poster_path ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}` : null,
			url: localeProviders?.link || homepage || null,
			seasons: number_of_seasons,
			episodes: {
				total: number_of_episodes,
				duration: episode_run_time.length > 0 ? formatDuration(episode_run_time[0] * 1000 * 60) : null,
				next: {
					date: next_episode_to_air instanceof Object ? next_episode_to_air.air_date : next_episode_to_air,
				},
				last: {
					date: last_episode_to_air.air_date,
				},
			},
			providers: {
				buy: localeProviders?.buy?.map((provider) => provider.provider_name) ?? [],
				rent: localeProviders?.rent?.map((provider) => provider.provider_name) ?? [],
				stream: localeProviders?.flatrate?.map((provider) => provider.provider_name) ?? [],
			},
		};
	}
}
