import { DateUtil, StringUtil } from "@luferro/shared-utils";
import { type Client, cacheExchange, createClient, fetchExchange } from "@urql/core";
import { AiringSchedule, ExternalLinkType, Media, MediaExternalLink, MediaType } from "../__generated__/graphql";
import { GET_ANIME } from "./graphql/queries/media";
import { GET_SCHEDULE } from "./graphql/queries/schedule";

export class AniListApi {
	static BASE_API_URL = "https://graphql.anilist.co";

	private client: Client;

	constructor() {
		this.client = createClient({ url: AniListApi.BASE_API_URL, exchanges: [cacheExchange, fetchExchange] });
	}

	private getTrackers(media: Media) {
		return [
			media.idMal ? { name: "MyAnimeList", url: `https://myanimelist.net/anime/${media.idMal}` } : null,
			{ name: "AniList", url: `https://anilist.co/anime/${media.id}` },
		].filter((tracker): tracker is NonNullable<typeof tracker> => !!tracker);
	}

	private getStreams(media: Media) {
		return (media.externalLinks ?? [])
			.filter((externalLink): externalLink is MediaExternalLink => externalLink?.type === ExternalLinkType.Streaming)
			.map((externalLink) => ({ name: externalLink.site, url: externalLink.url }));
	}

	async getAnimeById(id: string) {
		const { data } = await this.client.query(GET_ANIME, { type: MediaType.Anime, id: Number(id) });
		const media = data?.Media as unknown as Media;

		return {
			id: `${media.idMal ?? media.id}`,
			type: media.type!,
			title: {
				romaji: media.title?.romaji ?? null,
				english: media.title?.english ?? null,
				native: media.title?.native ?? null,
			},
			description: media.description ?? null,
			season: media.season && media.seasonYear ? `${media.season} ${media.seasonYear}` : null,
			coverImage: {
				medium: media.coverImage?.medium ?? null,
				large: media.coverImage?.large ?? null,
				extraLarge: media.coverImage?.extraLarge ?? null,
			},
			bannerImage: media.bannerImage ?? null,
			format: media.format ?? null,
			status: media.status ? StringUtil.capitalize(media.status.toLowerCase()) : null,
			episodes: media.episodes ?? null,
			duration: media.duration ?? null,
			streams: this.getStreams(media),
			trackers: this.getTrackers(media),
		};
	}

	async getWeeklySchedule() {
		const start = Math.floor(DateUtil.startOfWeek(Date.now()).getTime() / 1000);
		const end = Math.floor(DateUtil.endOfWeek(Date.now()).getTime() / 1000);
		const schedule = [];

		let page = 1;
		let hasNextPage = true;
		while (hasNextPage) {
			const { data } = await this.client.query(GET_SCHEDULE, { page, start, end });
			const pageResult = data?.Page;
			const airingSchedules = (pageResult?.airingSchedules ?? []) as (AiringSchedule & { media: Media })[];

			schedule.push(...airingSchedules);
			hasNextPage = !!pageResult?.pageInfo?.hasNextPage;
			page++;
		}

		return schedule
			.filter(({ media }) => media.countryOfOrigin === "JP")
			.map(({ airingAt, episode, media }) => ({
				id: `${media.idMal ?? media.id}`,
				title: {
					romaji: media.title?.romaji ?? null,
					english: media.title?.english ?? null,
					native: media.title?.native ?? null,
				},
				isMature: !!media.isAdult,
				format: media.format ?? null,
				season:
					media.season && media.seasonYear
						? `${StringUtil.capitalize(media.season.toLowerCase())} ${media.seasonYear}`
						: null,
				coverImage: {
					medium: media.coverImage?.medium ?? null,
					large: media.coverImage?.large ?? null,
					extraLarge: media.coverImage?.extraLarge ?? null,
				},
				airing: {
					episode,
					raw: { at: airingAt * 1000 },
				},
				score: media.averageScore ? media.averageScore / 10 : null,
				episodes: media.episodes ?? null,
				duration: media.duration ?? null,
				streams: this.getStreams(media),
				trackers: this.getTrackers(media),
			}));
	}

	// getRecommendations;
}
