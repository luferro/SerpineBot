import { endOfWeek, getWeek, isMonday, isSunday, startOfWeek } from "@luferro/helpers/datetime";
import { type Client, cacheExchange, createClient, fetchExchange } from "@urql/core";
import { requestPolicyExchange } from "@urql/exchange-request-policy";
import type {
	AiringSchedule,
	BrowseMediaQueryVariables,
	Character,
	Media,
	MediaType,
	PageInfo,
	SearchQueryVariables,
	Staff,
	Studio,
} from "./__generated__/graphql.js";
import { AnimeScheduleApi } from "./anime-schedule/anime-schedule.api.js";
import { BROWSE_MEDIA, GET_CHARACTERS, GET_MEDIA, GET_RECOMMENDATIONS, GET_STAFF } from "./graphql/queries/media.js";
import { GET_SCHEDULE } from "./graphql/queries/schedule.js";
import { SEARCH } from "./graphql/queries/search.js";
import {
	extractCharacter,
	extractCharacters,
	extractMediaFields,
	extractStaff,
	extractStaffMember,
	extractStreams,
	extractStudio,
	extractStudios,
	extractTrackers,
} from "./utils/extractors.js";

export * from "./anilist.types.js";

export class AniListApi {
	static BASE_API_URL = "https://graphql.anilist.co";

	private client: Client;
	private animeScheduleApi?: AnimeScheduleApi;

	constructor() {
		this.client = createClient({
			url: AniListApi.BASE_API_URL,
			exchanges: [requestPolicyExchange({ ttl: 1000 * 60 * 60 }), cacheExchange, fetchExchange],
			requestPolicy: "cache-only",
			suspense: true,
		});
	}

	/** Allows weekly schedules to include subs as well as raws */
	withAnimeScheduleApi(apiKey: string) {
		this.animeScheduleApi = new AnimeScheduleApi(apiKey);
		return this;
	}

	async search(query: string, options: Omit<SearchQueryVariables, "query"> = {}) {
		const { data } = await this.client.query(SEARCH, { query, ...options });

		return {
			anime: {
				pageInfo: { total: data?.anime?.pageInfo?.total ?? null },
				results: ((data?.anime?.results ?? []) as Media[]).map(extractMediaFields),
			},
			manga: {
				pageInfo: { total: data?.manga?.pageInfo?.total ?? null },
				results: ((data?.manga?.results ?? []) as Media[]).map(extractMediaFields),
			},
			characters: {
				pageInfo: { total: data?.characters?.pageInfo?.total ?? null },
				results: ((data?.characters?.results ?? []) as Character[]).map(extractCharacter),
			},
			staff: {
				pageInfo: { total: data?.staff?.pageInfo?.total ?? null },
				results: ((data?.staff?.results ?? []) as Staff[]).map(extractStaffMember),
			},
			studios: {
				pageInfo: { total: data?.studios?.pageInfo?.total ?? null },
				results: ((data?.studios?.results ?? []) as Studio[]).map(extractStudio),
			},
		};
	}

	async browse(type: MediaType, { page = 1, ...options }: Omit<BrowseMediaQueryVariables, "type">) {
		const { data } = await this.client.query(BROWSE_MEDIA, { type, page, ...options });
		const media = (data?.Page?.media ?? []) as Media[];
		const pageInfo = data?.Page?.pageInfo as Omit<PageInfo, "__typename">;

		return {
			pageInfo,
			media: media.map(extractMediaFields),
		};
	}

	async getMediaById(id: string, type: MediaType) {
		const { data } = await this.client.query(GET_MEDIA, { type, id: Number(id) });
		const media = data?.Media as Media;

		const relations = (media.relations?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return {
					edgeId: edge.id!,
					relationType: edge.relationType!,
					media: extractMediaFields(node),
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		return {
			...extractMediaFields(media),
			relations,
			studios: extractStudios(media),
			streams: extractStreams(media),
			trackers: extractTrackers(media),
			preview: { characters: extractCharacters(media), staff: extractStaff(media) },
		};
	}

	async getCharacters(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_CHARACTERS, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.characters?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, characters: extractCharacters(media) };
	}

	async getStaff(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_STAFF, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.staff?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, staff: extractStaff(media) };
	}

	async getRecommendations(id: string, { page = 1 } = {}) {
		const { data } = await this.client.query(GET_RECOMMENDATIONS, { page, id: Number(id) });
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.recommendations?.pageInfo as Omit<PageInfo, "__typename">;

		const recommendations = (media.recommendations?.nodes ?? [])
			.map((node) => {
				const recommendation = node?.mediaRecommendation;
				if (!node || !recommendation) return;

				return {
					nodeId: node.id,
					rating: node.rating!,
					media: extractMediaFields(recommendation),
				};
			})
			.filter((node): node is NonNullable<typeof node> => !!node);

		return { pageInfo, recommendations };
	}

	private async getRawsSchedule(start: number, end: number) {
		let page = 1;
		let hasNextPage = true;
		const schedule = [];
		while (hasNextPage) {
			const { data } = await this.client.query(GET_SCHEDULE, {
				page,
				start: Math.floor(start / 1000),
				end: Math.floor(end / 1000),
			});
			const pageResult = data?.Page;
			const airingSchedules = (pageResult?.airingSchedules ?? []) as (AiringSchedule & { media: Media })[];

			schedule.push(...airingSchedules);
			hasNextPage = !!pageResult?.pageInfo?.hasNextPage;
			page++;
		}
		return schedule;
	}

	private async getSubsSchedule(start: number, end: number) {
		if (!this.animeScheduleApi) return [];

		const startDate = new Date(start);
		const endDate = new Date(end);
		const isWeeklySchedule = isMonday(startDate) && isSunday(endDate);
		const weeks = [startDate];
		if (!isWeeklySchedule) weeks.push(endDate);

		const schedule = [];
		for (const date of weeks) {
			const week = getWeek(date, { weekStartsOn: 1 });
			const year = date.getFullYear();
			schedule.push(...(await this.animeScheduleApi.getWeekSchedule(week, year).catch(() => [])));
		}
		return schedule;
	}

	async getAiringSchedule({ start = startOfWeek(Date.now()).getTime(), end = endOfWeek(Date.now()).getTime() } = {}) {
		const extractTitles = (record: Record<string, unknown>) => {
			return Object.values(record)
				.filter((title): title is string => !!title)
				.map((title) => title.toUpperCase());
		};

		const rawsSchedule = await this.getRawsSchedule(start, end);
		const subsSchedule = await this.getSubsSchedule(start, end);
		const schedule = rawsSchedule
			.filter(({ media }) => media.countryOfOrigin === "JP")
			.map(({ airingAt, episode, media }) => {
				const rawAt = airingAt * 1000;
				const rawDate = new Date(rawAt);
				rawDate.setHours(0, 0, 0, 0);

				const fields = extractMediaFields(media);

				const match = subsSchedule
					?.filter((sub) => {
						const subDate = new Date(sub.airing.sub.at);
						subDate.setHours(0, 0, 0, 0);
						return rawDate.getTime() === subDate.getTime();
					})
					.find((sub) => extractTitles(fields.title).some((raw) => extractTitles(sub.title).includes(raw)));
				const subAt = match?.airing.sub.at ?? null;

				return {
					...fields,
					isDelayed: match?.isDelayed ?? null,
					isAiring: match?.isAiring ?? null,
					hasAired: match?.hasAired ?? null,
					airing: {
						episode,
						default: { at: subAt ?? rawAt },
						raw: { at: rawAt },
						sub: { at: subAt },
						delay: { from: match?.airing.delay.from ?? null, until: match?.airing.delay.until ?? null },
					},
					studios: extractStudios(media),
					streams: extractStreams(media),
					trackers: extractTrackers(media),
				};
			})
			.sort((a, b) => a.airing.default.at - b.airing.default.at);

		const groupedSchedule = new Map<number, typeof schedule>();
		for (const anime of schedule) {
			const dayOfTheWeek = new Date(anime.airing.default.at).getUTCDay();

			const storedEntries = groupedSchedule.get(dayOfTheWeek);
			if (!storedEntries) {
				groupedSchedule.set(dayOfTheWeek, [anime]);
				continue;
			}

			groupedSchedule.set(dayOfTheWeek, storedEntries.concat(anime));
		}

		return groupedSchedule;
	}
}
