import { DateUtil, FetchUtil } from "@luferro/shared-utils";

import { ApiKey, Id } from "../../../types/args";
import { Anime, Schedule } from "./anime-schedule.types";

export class AnimeScheduleApi {
	private static BASE_URL = "https://animeschedule.net";
	private static BASE_IMAGE_URL = "https://img.animeschedule.net";

	private apiKey: string;
	private timezone = "Europe/Lisbon";

	constructor({ apiKey }: ApiKey) {
		this.apiKey = apiKey;
	}

	withTimezone(timezone: string) {
		this.timezone = timezone;
		return this;
	}

	private getCustomHeaders() {
		return new Map([["Authorization", `Bearer ${this.apiKey}`]]);
	}

	async getAnimeById({ id }: Id) {
		const { payload } = await FetchUtil.fetch<Anime>({
			url: `${AnimeScheduleApi.BASE_URL}/api/v3/anime/${id}`,
			customHeaders: this.getCustomHeaders(),
		});

		const { mal, aniList, animePlanet, kitsu } = payload.websites;
		const trackersList = [mal, aniList, animePlanet, kitsu];
		const trackers = Object.entries(payload.websites)
			.filter(({ 1: href }) => trackersList.includes(href))
			.map(([tracker, href]) => ({ tracker, url: `https://${href}` }));

		const { crunchyroll, funimation, hidive, netflix, youtube, wakanim, hulu, amazon } = payload.websites;
		const streamsList = [crunchyroll, funimation, hidive, netflix, youtube, wakanim, hulu, amazon];
		const streams = Object.entries(payload.websites)
			.filter(({ 1: href }) => streamsList.includes(href))
			.map(([tracker, href]) => ({ tracker, url: `https://${href}` }));

		return {
			trackers,
			streams,
			titles: { default: payload.title, alternative: payload.names?.english ?? null },
			url: payload.websites.official ?? `${AnimeScheduleApi.BASE_URL}/anime/${payload.route}`,
			image: `${AnimeScheduleApi.BASE_IMAGE_URL}/production/assets/public/img/${payload.imageVersionRoute}`,
			premier: payload.premier,
			score: payload.stats.averageScore > 0 ? Math.round(payload.stats.averageScore) / 10 : null,
			description: payload.description,
			status: payload.status,
			season: payload.season.title,
			episodes: {
				total: payload.episodes,
				duration: payload.lengthMin,
			},
			genres: payload.genres.map(({ name }) => name),
			studios: payload.studios.map(({ name }) => name),
			sources: payload.sources.map(({ name }) => name),
		};
	}

	async getWeeklySchedule() {
		const year = new Date().getFullYear();
		const week = DateUtil.getWeek(new Date());
		const { payload } = await FetchUtil.fetch<Schedule[]>({
			url: `${AnimeScheduleApi.BASE_URL}/api/v3/timetables/sub?year=${year}&week=${week}&tz=${this.timezone}`,
			customHeaders: this.getCustomHeaders(),
		});

		return payload.map((anime) => ({
			id: anime.route,
			titles: { default: anime.title, alternative: anime.english },
			url: `${AnimeScheduleApi.BASE_URL}/anime/${anime.route}`,
			image: `${AnimeScheduleApi.BASE_IMAGE_URL}/production/assets/public/img/${anime.imageVersionRoute}`,
			status: anime.status,
			episodes: {
				total: anime.episodes,
				duration: anime.lengthMin,
				current: { number: anime.episodeNumber, date: anime.episodeDate },
				delay: {
					from: anime.delayedFrom !== "0001-01-01T00:00:00Z" ? anime.delayedFrom : null,
					until: anime.delayedUntil !== "0001-01-01T00:00:00Z" ? anime.delayedUntil : null,
				},
			},
			streams: Object.entries(anime.streams).map(([stream, href]) => ({ stream, url: `https://${href}` })),
			hasAired: anime.airingStatus === "aired",
			isAiring: anime.airingStatus === "airing",
			isDelayed: anime.airingStatus === "delayed-air",
		}));
	}
}
