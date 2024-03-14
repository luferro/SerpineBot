import { Scraper } from "@luferro/scraper";
import { DateUtil, StringUtil } from "@luferro/shared-utils";
import { type Client, cacheExchange, createClient, fetchExchange } from "@urql/core";
import {
	type AiringSchedule,
	ExternalLinkType,
	type Media,
	type MediaExternalLink,
	type MediaRank,
	type MediaType,
	type PageInfo,
} from "./__generated__/graphql";
import { AnimeScheduleApi } from "./anime-schedule/anime-schedule.api";
import { GET_CHARACTERS, GET_MEDIA, GET_RECOMMENDATIONS, GET_STAFF } from "./graphql/queries/media";
import { GET_SCHEDULE } from "./graphql/queries/schedule";
import { SEARCH } from "./graphql/queries/search";

export class AniListApi {
	static BASE_API_URL = "https://graphql.anilist.co";

	private client: Client;
	private scraper: Scraper;
	private animeScheduleApi?: AnimeScheduleApi;

	constructor() {
		this.client = createClient({ url: AniListApi.BASE_API_URL, exchanges: [cacheExchange, fetchExchange] });
		this.scraper = new Scraper();
	}

	private extractMediaFields(media: Media) {
		return {
			type: media.type!,
			id: media.id.toString(),
			malId: media.idMal ? media.idMal.toString() : null,
			title: {
				romaji: media.title?.romaji ?? null,
				english: media.title?.english ?? null,
				native: media.title?.native ?? null,
			},
			description: media.description ?? null,
			trailer: media.trailer?.site ?? null,
			coverImage: {
				medium: media.coverImage?.medium ?? null,
				large: media.coverImage?.large ?? null,
				extraLarge: media.coverImage?.extraLarge ?? null,
			},
			bannerImage: media.bannerImage ?? null,
			isMature: !!media.isAdult,
			format: media.format ?? null,
			status: media.status ? StringUtil.capitalize(media.status.toLowerCase()) : null,
			source: media.source ?? null,
			startDate: media.startDate ?? null,
			endDate: media.endDate ?? null,
			season:
				media.season && media.seasonYear
					? `${StringUtil.capitalize(media.season.toLowerCase())} ${media.seasonYear}`
					: null,
			genres: (media.genres ?? []) as string[],
			nextAiringEpisode: {
				episode: media.nextAiringEpisode?.episode ?? null,
				raw: { at: media.nextAiringEpisode ? media.nextAiringEpisode.airingAt * 1000 : null },
			},
			countryOfOrigin: media.countryOfOrigin as string,
			averageScore: media.averageScore ?? null,
			meanScore: media.meanScore ?? null,
			popularity: media.popularity ?? null,
			isLicensed: !!media.isLicensed,
			episodes: media.episodes ?? null,
			duration: media.duration ?? null,
		};
	}

	private extractRankings(media: Media) {
		return (media.rankings ?? [])
			.filter((ranking): ranking is MediaRank => !!ranking)
			.map((ranking) => ({
				id: ranking.id,
				rank: ranking.rank,
				type: ranking.type,
				allTime: !!ranking.allTime,
				year: ranking.year ?? null,
				formatted: `#${ranking.rank} ${ranking.context} ${!ranking.allTime ? ranking.year : ""}`.trim(),
			}));
	}

	private extractCharacters(media: Media) {
		return (media.characters?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node?.name) return;

				const voiceActors = (edge.voiceActors ?? [])
					.map((voiceActor) => {
						if (!voiceActor?.name) return;
						return {
							id: voiceActor.id,
							name: voiceActor.name.full!,
							language: voiceActor.languageV2!,
							image: voiceActor.image?.large ?? null,
						};
					})
					.filter((voiceActor): voiceActor is NonNullable<typeof voiceActor> => !!voiceActor);
				return {
					edgeId: edge.id!,
					role: edge.role!,
					character: { id: node.id, name: node.name.full!, image: node.image?.large ?? null },
					voiceActors,
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);
	}

	private extractStaff(media: Media) {
		return (media.staff?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node?.name) return;

				return {
					edgeId: edge.id!,
					role: edge.role!,
					staff: { id: node.id, name: node.name.full!, language: node.languageV2!, image: node.image?.large ?? null },
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);
	}

	private extractStudios(media: Media) {
		return (media.studios?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return {
					edgeId: edge.id,
					isMain: edge.isMain,
					studio: { id: node.id, name: node.name },
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);
	}

	private extractTrackers(media: Media) {
		const type = media.type!.toLowerCase();

		return [
			media.idMal ? { name: "MyAnimeList", url: `https://myanimelist.net/${type}/${media.idMal}` } : null,
			{ name: "AniList", url: `https://anilist.co/${type}/${media.id}` },
		].filter((tracker): tracker is NonNullable<typeof tracker> => !!tracker);
	}

	private extractStreams(media: Media) {
		return (media.externalLinks ?? [])
			.filter((externalLink): externalLink is MediaExternalLink => externalLink?.type === ExternalLinkType.Streaming)
			.map((externalLink) => ({ name: externalLink.site, url: externalLink.url }));
	}

	/** Allows weekly schedules to include subs as well as raws */
	withAnimeScheduleApi(apiKey: string) {
		this.animeScheduleApi = new AnimeScheduleApi(apiKey);
		return this;
	}

	async search(query: string, { isMature = true }) {
		const { data } = await this.client.query(SEARCH, { search: query, isMature });
		return data ?? null;
	}

	async getMediaById(id: string, type: MediaType) {
		const { data } = await this.client.query(GET_MEDIA, { type, id: Number(id) });
		const media = data?.Media as Media;

		const relations = (media.relations?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				const { type, id, malId, title, coverImage, bannerImage, format, status } = this.extractMediaFields(node);

				return {
					edgeId: edge.id!,
					relationType: edge.relationType!,
					media: { type, id, malId, title, coverImage, bannerImage, format, status },
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		return {
			relations,
			studios: this.extractStudios(media),
			rankings: this.extractRankings(media),
			streams: this.extractStreams(media),
			trackers: this.extractTrackers(media),
			preview: { characters: this.extractCharacters(media), staff: this.extractStaff(media) },
			...this.extractMediaFields(media),
		};
	}

	async getCharacters(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_CHARACTERS, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.characters?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, characters: this.extractCharacters(media) };
	}

	async getStaff(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_STAFF, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.staff?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, staff: this.extractStaff(media) };
	}

	async getRecommendations(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_RECOMMENDATIONS, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.recommendations?.pageInfo as Omit<PageInfo, "__typename">;

		const recommendations = (media.recommendations?.nodes ?? [])
			.map((node) => {
				const recommendation = node?.mediaRecommendation;
				if (!node || !recommendation) return;

				const { type, id, malId, title, format, status, coverImage, bannerImage } =
					this.extractMediaFields(recommendation);

				return {
					nodeId: node.id,
					rating: node.rating!,
					media: { type, id, malId, title, format, status, coverImage, bannerImage },
				};
			})
			.filter((node): node is NonNullable<typeof node> => !!node);

		return { pageInfo, recommendations };
	}

	async getWeeklySchedule() {
		const start = Math.floor(DateUtil.startOfWeek(Date.now()).getTime() / 1000);
		const end = Math.floor(DateUtil.endOfWeek(Date.now()).getTime() / 1000);
		const rawsSchedule = [];

		let page = 1;
		let hasNextPage = true;
		while (hasNextPage) {
			const { data } = await this.client.query(GET_SCHEDULE, { page, start, end });
			const pageResult = data?.Page;
			const airingSchedules = (pageResult?.airingSchedules ?? []) as (AiringSchedule & { media: Media })[];

			rawsSchedule.push(...airingSchedules);
			hasNextPage = !!pageResult?.pageInfo?.hasNextPage;
			page++;
		}

		const prepare = (record: Record<string, unknown>) => {
			return Object.values(record)
				.filter((title): title is string => !!title)
				.map((title) => title.toUpperCase());
		};

		const subsSchedule = await this.animeScheduleApi?.getWeeklySchedule().catch(() => []);

		return Promise.all(
			rawsSchedule
				.filter(({ media }) => media.countryOfOrigin === "JP")
				.map(async ({ airingAt, episode, media }) => {
					const {
						id,
						malId,
						title,
						coverImage,
						bannerImage,
						isMature,
						format,
						season,
						averageScore,
						meanScore,
						episodes,
						duration,
					} = this.extractMediaFields(media);

					const match = subsSchedule?.find((sub) =>
						prepare(title).find((rawTitleEntry) => prepare(sub.title).includes(rawTitleEntry)),
					);

					return {
						id,
						malId,
						title,
						coverImage,
						bannerImage,
						isMature,
						format,
						season,
						averageScore,
						meanScore,
						episodes,
						duration,
						isDelayed: match?.isDelayed ?? null,
						isAiring: match?.isAiring ?? null,
						hasAired: match?.hasAired ?? null,
						airing: {
							episode,
							raw: { at: airingAt * 1000 },
							sub: { at: match?.airing.sub.at ?? null },
							delay: { from: match?.airing.delay.from ?? null, until: match?.airing.delay.until ?? null },
						},
						rankings: this.extractRankings(media),
						studios: this.extractStudios(media),
						streams: this.extractStreams(media),
						trackers: this.extractTrackers(media),
					};
				}),
		);
	}
}
