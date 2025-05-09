import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import { endOfWeek, getWeek, isMonday, isSunday, startOfWeek } from "@luferro/utils/date";

import type { AnimeScheduleAiringScheduleInput } from "~/model/schema.generated.js";
import type { AiringSchedule } from "./dtos/AnimeScheduleApiDtos.js";

export class AnimeScheduleDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://animeschedule.net/api/v3/";
	protected readonly token: string;

	constructor({ token }: { token: string }) {
		super();
		this.token = token;
	}

	protected async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		request.headers.Authorization = this.token;
	}

	async getAiringSchedule(
		variables: AnimeScheduleAiringScheduleInput = {
			start: startOfWeek(Date.now()).getTime(),
			end: endOfWeek(Date.now()).getTime(),
			tz: "Europe/Lisbon",
		},
	) {
		const startDate = new Date(variables.start);
		const endDate = new Date(variables.end);
		const isWeeklySchedule = isMonday(startDate) && isSunday(endDate);
		const weeks = [startDate];
		if (!isWeeklySchedule) weeks.push(endDate);

		const schedule = [];
		for (const date of weeks) {
			const week = getWeek(date, { weekStartsOn: 1 });
			const year = date.getFullYear();

			const data = await this.get<AiringSchedule[]>("timetables/sub", {
				params: { year: year.toString(), week: week.toString(), tz: variables.tz },
			}).catch(() => []);

			schedule.push(...data);
		}

		return schedule.map((media) => ({
			id: media.route,
			title: {
				default: media.title,
				romaji: media.romaji,
				english: media.english,
				native: media.native,
			},
			airing: {
				episode: media.episodeNumber,
				airingAt: media.episodeDate ? new Date(media.episodeDate).getTime() : null,
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
