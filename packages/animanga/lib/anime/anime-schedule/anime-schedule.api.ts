import { DateUtil, FetchUtil } from "@luferro/shared-utils";
import { Schedule } from "./anime-schedule.types";

export class AnimeScheduleApi {
	private static BASE_URL = "https://animeschedule.net";

	constructor(private apiKey: string) {}

	private getHeaders() {
		return new Map([["Authorization", `Bearer ${this.apiKey}`]]);
	}

	async getWeeklySchedule({ timezone = "Europe/Lisbon" } = {}) {
		const date = new Date();
		const year = date.getFullYear();
		const week = DateUtil.getWeek(date, { weekStartsOn: 1 });

		const { payload } = await FetchUtil.fetch<Schedule[]>(
			`${AnimeScheduleApi.BASE_URL}/api/v3/timetables/sub?year=${year}&week=${week}&tz=${timezone}`,
			{ headers: this.getHeaders() },
		);

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
