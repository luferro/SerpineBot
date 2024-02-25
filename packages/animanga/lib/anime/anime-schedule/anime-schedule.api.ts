import { DateUtil, FetchUtil } from "@luferro/shared-utils";

import { Schedule } from "./anime-schedule.types";

type ApiKey = { apiKey: string };

export class AnimeScheduleApi {
	private static BASE_URL = "https://animeschedule.net";

	private apiKey: string;
	private timezone = "Europe/Lisbon";

	constructor({ apiKey }: ApiKey) {
		this.apiKey = apiKey;
	}

	withTimezone(timezone: string) {
		this.timezone = timezone;
		return this;
	}

	async getWeeklySchedule() {
		const date = new Date();
		const year = date.getFullYear();
		const week = DateUtil.getWeek(date, { weekStartsOn: 1 });

		const { payload } = await FetchUtil.fetch<Schedule[]>({
			url: `${AnimeScheduleApi.BASE_URL}/api/v3/timetables/sub?year=${year}&week=${week}&tz=${this.timezone}`,
			customHeaders: new Map([["Authorization", `Bearer ${this.apiKey}`]]),
		});

		return payload.map((media) => ({
			id: media.route,
			title: {
				default: media.title,
				romaji: media.romaji,
				english: media.english,
				native: media.native,
			},
			airing: {
				episode: media.episodeNumber,
				sub: { at: new Date(media.episodeDate).getTime() },
				delay: {
					from: media.delayedFrom !== "0001-01-01T00:00:00Z" ? media.delayedFrom : null,
					until: media.delayedUntil !== "0001-01-01T00:00:00Z" ? media.delayedUntil : null,
				},
			},
			episodes: media.episodes,
			duration: media.lengthMin,
			hasAired: media.airingStatus === "aired",
			isAiring: media.airingStatus === "airing",
			isDelayed: media.airingStatus === "delayed-air",
		}));
	}
}
