import { endOfWeek, getWeek, isMonday, isSunday, startOfWeek } from "@luferro/helpers/datetime";
import { type Client, cacheExchange, createClient, fetchExchange } from "@urql/core";
import { requestPolicyExchange } from "@urql/exchange-request-policy";
import {
	type AiringSchedule,
	type BrowseMediaQueryVariables,
	type Character,
	type Media,
	MediaSort,
	type MediaType,
	type PageInfo,
	type SearchQueryVariables,
	type Staff,
	type Studio,
} from "./__generated__/graphql.js";
import { AnimeScheduleApi } from "./anime-schedule/anime-schedule.api.js";
import { GET_CHARACTER_BY_ID } from "./graphql/queries/character.js";
import { BROWSE_MEDIA, GET_CHARACTERS, GET_MEDIA, GET_RECOMMENDATIONS, GET_STAFF } from "./graphql/queries/media.js";
import { GET_SCHEDULE } from "./graphql/queries/schedule.js";
import { SEARCH } from "./graphql/queries/search.js";
import { GET_STAFF_BY_ID } from "./graphql/queries/staff.js";
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

	constructor(ttl = 1000 * 60 * 60) {
		this.client = createClient({
			url: AniListApi.BASE_API_URL,
			exchanges: [requestPolicyExchange({ ttl }), cacheExchange, fetchExchange],
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
		const { data, operation } = await this.client.query(SEARCH, { query, ...options });
		console.log(operation.context.requestPolicy);

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

	async browse({ page = 1, ...options }: BrowseMediaQueryVariables) {
		const { data, operation } = await this.client.query(BROWSE_MEDIA, { page, ...options });
		console.log(operation.context.requestPolicy);
		const media = (data?.Page?.media ?? []) as Media[];
		const pageInfo = data?.Page?.pageInfo as Omit<PageInfo, "__typename">;

		return {
			pageInfo,
			media: media.map((media) => ({
				...extractMediaFields(media),
				studios: extractStudios(media),
				preview: { characters: extractCharacters(media), staff: extractStaff(media) },
			})),
		};
	}

	async getMediaById(id: string, type: MediaType) {
		const { data, operation } = await this.client.query(GET_MEDIA, { type, id: Number(id) });
		console.log(operation.context.requestPolicy);
		const media = data?.Media as Media;

		const relations = (media?.relations?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return { relationType: edge.relationType!, media: extractMediaFields(node) };
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

	async getCharacterById(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_CHARACTER_BY_ID, {
			page,
			id: Number(id),
			sort: MediaSort.PopularityDesc,
			withRoles: true,
		});
		console.log(operation.context.requestPolicy);

		const character = data?.Character as Character;
		const pageInfo = data?.Character?.media?.pageInfo as Omit<PageInfo, "__typename">;

		const media = (data?.Character?.media?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return {
					role: edge.characterRole!,
					staff: (edge.voiceActorRoles ?? []).map((voiceActorRole) =>
						extractStaffMember(voiceActorRole?.voiceActor as Staff),
					),
					media: extractMediaFields(node as Media),
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		return { pageInfo, media, character: extractCharacter(character) };
	}

	async getCharacters(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_CHARACTERS, { page, id: Number(id) });
		console.log(operation.context.requestPolicy);
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.characters?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, characters: extractCharacters(media) };
	}

	async getStaff(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_STAFF, { page, id: Number(id) });
		console.log(operation.context.requestPolicy);
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.staff?.pageInfo as Omit<PageInfo, "__typename">;
		return { pageInfo, staff: extractStaff(media) };
	}

	async getStaffById(id: string, { characterPage = 1, staffPage = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_STAFF_BY_ID, {
			characterPage,
			staffPage,
			id: Number(id),
			sort: MediaSort.StartDateDesc,
			withCharacterRoles: true,
			withStaffRoles: true,
		});
		console.log(operation.context.requestPolicy);

		const staff = data?.Staff as Staff;

		const characters = (staff?.characterMedia?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return {
					role: edge.characterRole!,
					characters: (edge.characters ?? []).map((character) => extractCharacter(character as Character)),
					media: extractMediaFields(node as Media),
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		const roles = (staff?.staffMedia?.edges ?? [])
			.map((edge) => {
				const node = edge?.node;
				if (!edge || !node) return;

				return { role: edge.staffRole!, media: extractMediaFields(node as Media) };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		return {
			staff: extractStaffMember(staff),
			voiceActing: { pageInfo: staff?.characterMedia?.pageInfo as Omit<PageInfo, "__typename">, characters },
			production: { pageInfo: staff?.staffMedia?.pageInfo as Omit<PageInfo, "__typename">, roles },
		};
	}

	async getRecommendations(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_RECOMMENDATIONS, { page, id: Number(id) });
		console.log(operation.context.requestPolicy);
		const media = data?.Media as Media;
		const pageInfo = data?.Media?.recommendations?.pageInfo as Omit<PageInfo, "__typename">;

		const recommendations = (media?.recommendations?.nodes ?? [])
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
			const { data, operation } = await this.client.query(GET_SCHEDULE, {
				page,
				start: Math.floor(start / 1000),
				end: Math.floor(end / 1000),
			});
			console.log(operation.context.requestPolicy);
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
