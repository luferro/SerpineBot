import { endOfWeek, getWeek, isMonday, isSunday, startOfWeek } from "@luferro/helpers/datetime";
import { type Logger, configureLogger } from "@luferro/helpers/logger";
import { type Client, cacheExchange, createClient, fetchExchange } from "@urql/core";
import { requestPolicyExchange } from "@urql/exchange-request-policy";
import {
	type AiringSchedule,
	type BrowseMediaQueryVariables,
	type Character,
	type DeleteMediaMutationVariables,
	type GetActiveMediaListCollectionQueryVariables,
	type GetMediaListCollectionQueryVariables,
	type Media,
	type MediaList,
	MediaListStatus,
	MediaSort,
	type MediaTag,
	type MediaType,
	type PageInfo,
	type SaveMediaMutationVariables,
	type SearchQueryVariables,
	type Staff,
	type Studio,
	type ToggleFavoriteMutationVariables,
	type User,
} from "./__generated__/graphql.js";
import { AnimeScheduleApi } from "./anime-schedule/anime-schedule.api.js";
import { DELETE_MEDIA, SAVE_MEDIA, TOGGLE_FAVORITE } from "./graphql/mutations/media.js";
import { GET_CHARACTER_BY_ID } from "./graphql/queries/character.js";
import {
	BROWSE_MEDIA,
	GET_ACTIVE_MEDIA_LIST_COLLECTION,
	GET_CHARACTERS,
	GET_MEDIA,
	GET_MEDIA_LIST_COLLECTION,
	GET_RECOMMENDATIONS,
	GET_STAFF,
} from "./graphql/queries/media.js";
import { GET_SCHEDULE } from "./graphql/queries/schedule.js";
import { GET_GENRES_AND_TAGS, SEARCH } from "./graphql/queries/search.js";
import { GET_STAFF_BY_ID } from "./graphql/queries/staff.js";
import {
	extractCharacter,
	extractCharacters,
	extractMediaFields,
	extractMediaList,
	extractStaff,
	extractStaffMember,
	extractStreams,
	extractStudio,
	extractStudios,
	extractTrackers,
	extractUser,
} from "./utils/extractors.js";

export * from "./anilist.types.js";

type Options = {
	ttl?: number;
	debug?: boolean;
};

export class AniListApi {
	static BASE_API_URL = "https://graphql.anilist.co";

	private client: Client;
	// private logger: Logger;
	private animeScheduleApi?: AnimeScheduleApi;

	constructor({ ttl = 1000 * 60 * 60, debug = false }: Options = {}) {
		// this.logger = configureLogger({ level: debug ? "debug" : "info" });
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

	getAuthorizationUrl(clientId: string) {
		return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
	}

	async getGenresAndTags() {
		const { data, operation } = await this.client.query(GET_GENRES_AND_TAGS, {});
		// this.logger.debug(operation);

		const genres = (data?.GenreCollection ?? []).filter((genre): genre is string => !!genre);
		const tags = (data?.MediaTagCollection ?? []).filter((tag): tag is MediaTag => !!tag);
		return { genres, tags };
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
		// this.logger.debug(operation);

		const media = (data?.Page?.media ?? []) as Media[];
		const pageInfo = data?.Page?.pageInfo as PageInfo;

		return {
			pageInfo,
			media: media.map((media) => ({
				...extractMediaFields(media),
				studios: extractStudios(media),
				preview: { characters: extractCharacters(media), staff: extractStaff(media) },
			})),
		};
	}

	async getTrendingMedia() {
		return this.browse({ page: 1, sort: [MediaSort.TrendingDesc, MediaSort.PopularityDesc] });
	}

	async getMediaById(id: string, type: MediaType) {
		const { data, operation } = await this.client.query(GET_MEDIA, { type, id: Number(id) });
		// this.logger.debug(operation);

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

	async getMediaListCollection(options: GetMediaListCollectionQueryVariables = {}) {
		const { data } = await this.client.query(GET_MEDIA_LIST_COLLECTION, options);
		const user = extractUser(data?.MediaListCollection?.user as User);
		const lists = data?.MediaListCollection?.lists?.map((list) => ({
			name: list?.name ?? "",
			isCustom: Boolean(list?.isCustomList),
			isCompletedList: Boolean(list?.isCompletedList),
			entries: list?.entries?.map((entry) => extractMediaList(entry as MediaList)),
		}));
		return { user, lists };
	}

	async getActiveMediaListCollection(options: GetActiveMediaListCollectionQueryVariables = {}) {
		const { data } = await this.client.query(GET_ACTIVE_MEDIA_LIST_COLLECTION, options);
		const pageInfo = data?.planning?.pageInfo as PageInfo;
		const list = (data?.planning?.mediaList ?? []).map((entry) => extractMediaList(entry as MediaList));

		return { pageInfo, list };
	}

	async saveMedia(authorization: string, id: string, options: Omit<SaveMediaMutationVariables, "mediaId"> = {}) {
		const { data } = await this.client.query(
			SAVE_MEDIA,
			{ mediaId: Number(id), ...options },
			{ fetchOptions: { headers: { authorization } } },
		);
		return data?.SaveMediaListEntry;
	}

	async deleteMedia(authorization: string, id: string, options: Omit<DeleteMediaMutationVariables, "mediaId"> = {}) {
		const { data } = await this.client.query(
			DELETE_MEDIA,
			{ mediaId: Number(id), ...options },
			{ fetchOptions: { headers: { authorization } } },
		);
		return data?.DeleteMediaListEntry;
	}

	async toggleFavorite(authorization: string, options: Omit<ToggleFavoriteMutationVariables, "mediaId"> = {}) {
		const { data } = await this.client.query(TOGGLE_FAVORITE, options, {
			fetchOptions: { headers: { authorization } },
		});
		return data?.ToggleFavourite;
	}

	async getCharacterById(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_CHARACTER_BY_ID, {
			page,
			id: Number(id),
			sort: MediaSort.PopularityDesc,
			withRoles: true,
		});
		// this.logger.debug(operation);

		const character = data?.Character as Character;
		const pageInfo = data?.Character?.media?.pageInfo as PageInfo;

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
		// this.logger.debug(operation);

		const media = data?.Media as Media;
		const pageInfo = data?.Media?.characters?.pageInfo as PageInfo;
		return { pageInfo, characters: extractCharacters(media) };
	}

	async getStaff(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_STAFF, { page, id: Number(id) });
		// this.logger.debug(operation);

		const media = data?.Media as Media;
		const pageInfo = data?.Media?.staff?.pageInfo as PageInfo;
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
		// this.logger.debug(operation);

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
			voiceActing: { pageInfo: staff?.characterMedia?.pageInfo as PageInfo, characters },
			production: { pageInfo: staff?.staffMedia?.pageInfo as PageInfo, roles },
		};
	}

	async getRecommendations(id: string, { page = 1 } = {}) {
		const { data, operation } = await this.client.query(GET_RECOMMENDATIONS, { page, id: Number(id) });
		// this.logger.debug(operation);

		const media = data?.Media as Media;
		const pageInfo = data?.Media?.recommendations?.pageInfo as PageInfo;

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
			// this.logger.debug(operation);

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
			groupedSchedule.set(dayOfTheWeek, storedEntries ? storedEntries.concat(anime) : [anime]);
		}

		return groupedSchedule;
	}
}
