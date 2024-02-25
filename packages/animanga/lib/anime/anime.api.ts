import { DateUtil } from "@luferro/shared-utils";
import { AniListApi } from "./anilist/anilist.api";
import { AnimeScheduleApi } from "./anime-schedule/anime-schedule.api";
import { Config } from "./anime.types";

export class AnimeApi extends AniListApi {
	private animeScheduleApi: AnimeScheduleApi;

	constructor(config: Config) {
		super();
		this.animeScheduleApi = new AnimeScheduleApi(config.animeSchedule);
	}

	override async getWeeklySchedule() {
		const rawsSchedule = await super.getWeeklySchedule();
		const subsSchedule = await this.animeScheduleApi.getWeeklySchedule();

		const prepare = (record: Record<string, unknown>) => {
			return Object.values(record)
				.filter((title): title is string => !!title)
				.map((title) => title.toUpperCase());
		};

		return rawsSchedule.map((raw) => {
			const match = subsSchedule.find((sub) =>
				prepare(raw.title).find((rawTitleEntry) => prepare(sub.title).includes(rawTitleEntry)),
			);

			return {
				...raw,
				isDelayed: match?.isDelayed ?? null,
				isAiring: match?.isAiring ?? null,
				hasAired: match?.hasAired ?? null,
				airing: {
					...raw.airing,
					sub: { at: match?.airing.sub.at ?? null },
					delay: { from: match?.airing.delay.from ?? null, until: match?.airing.delay.until ?? null },
				},
			};
		});
	}
}
