import { Scraper } from "@luferro/scraper";
import { DateUtil, FetchUtil, StringUtil } from "@luferro/shared-utils";
import { Chart, Payload, Profile, RecentlyPlayed } from "./xbox.types";

export class XboxApi extends Scraper {
	private static BASE_API_URL = "https://xbl.io";

	constructor(private apiKey: string) {
		super();
	}

	private getHeaders() {
		return new Map([
			["x-authorization", this.apiKey],
			["accept", "application/json"],
		]);
	}

	async search(gamertag: string) {
		const { payload } = await FetchUtil.fetch<Payload<Profile[]>>(`${XboxApi.BASE_API_URL}/api/v2/search/${gamertag}`, {
			headers: this.getHeaders(),
		});
		return payload.people.map(({ xuid, gamertag }) => ({ id: xuid, gamertag }));
	}

	async getProfile(id: string) {
		const { payload } = await FetchUtil.fetch<Payload<Profile[]>>(
			`${XboxApi.BASE_API_URL}/api/v2/player/summary/${id}`,
			{ headers: this.getHeaders() },
		);

		if (payload.people.length === 0) throw new Error(`Cannot find a profile for id ${id}.`);
		const { gamertag, gamerScore, displayPicRaw, presenceText, preferredPlatforms } = payload.people[0];

		return {
			id,
			gamertag,
			gamerscore: Number(gamerScore),
			image: displayPicRaw,
			status: presenceText,
			platforms: preferredPlatforms?.map((platform) => StringUtil.capitalize(platform)),
		};
	}

	async getRecentlyPlayed(id: string) {
		const { payload } = await FetchUtil.fetch<Payload<RecentlyPlayed[]>>(
			`${XboxApi.BASE_API_URL}/api/v2/player/titleHistory/${id}`,
			{ headers: this.getHeaders() },
		);

		return payload.titles
			.filter(
				({ titleHistory }) =>
					DateUtil.subWeeks(new Date(), 1).getTime() < new Date(titleHistory.lastTimePlayed).getTime(),
			)
			.map(({ titleId, name, displayImage, achievement }) => ({
				id: titleId,
				title: name,
				image: displayImage,
				gamerscore: {
					current: achievement.currentGamerscore,
					total: achievement.totalGamerscore,
				},
			}));
	}

	async getChart(chart: Chart) {
		const chartUrl: Record<typeof chart, string> = {
			[Chart.TOP_PLAYED]: "https://www.microsoft.com/pt-pt/store/most-played/games/xbox",
			[Chart.TOP_SELLERS]: "https://www.microsoft.com/pt-pt/store/top-paid/games/xbox",
			[Chart.UPCOMING_GAMES]: "https://www.microsoft.com/pt-pt/store/coming-soon/games/xbox",
		};
		const $ = await this.static.loadUrl(chartUrl[chart]);

		return $("section > ul li")
			.get()
			.slice(0, 10)
			.map((element, index) => {
				const position = index + 1;
				const name = $(element).find(".card-body a").text();
				const url = $(element).find(".card-body a").attr("href")!;

				return { position, name, url };
			});
	}
}
