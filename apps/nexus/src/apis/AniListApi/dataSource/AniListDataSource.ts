import { type AugmentedRequest, type CacheOptions, GraphQLDataSource } from "@luferro/graphql/server";
import { capitalize } from "@luferro/utils/data";
import { endOfWeek, startOfWeek } from "@luferro/utils/date";

import {
	type AniListAiringScheduleInput,
	type AniListBrowseInput,
	type AniListCharacterMediaConnection,
	type AniListCharacterPageInput,
	type AniListCharacterWithConnections,
	type AniListMedia,
	type AniListMediaCharactersConnection,
	type AniListMediaInput,
	type AniListMediaRelationsConnection,
	type AniListMediaStaffConnection,
	AniListMediaType,
	type AniListMediaWithConnections,
	type AniListPageInput,
	type AniListSearchInput,
	type AniListStaffMemberPageInput,
	type AniListStaffWithConnections,
	type AniListStudioMediaConnection,
	type AniListStudioWithConnections,
	type InputMaybe,
} from "~/model/schema.generated.js";
import type {
	AiringSchedule,
	Character,
	GenreCollection,
	Media,
	MultiSearchResult,
	PageInfo,
	Staff,
	Studio,
	TagCollection,
} from "./dtos/AniListApiDtos.js";
import { GET_CHARACTER_BY_ID } from "./queries/character.qry.js";
import { BROWSE_MEDIA, GET_CHARACTERS, GET_MEDIA, GET_RECOMMENDATIONS, GET_STAFF } from "./queries/media.qry.js";
import { GET_AIRING_SCHEDULE } from "./queries/schedule.qry.js";
import { GET_GENRES, GET_TAGS, MULTISEARCH } from "./queries/search.qry.js";
import { GET_STAFF_BY_ID } from "./queries/staff.qry.js";
import { GET_STUDIO_BY_ID } from "./queries/studio.qry.js";

export class AniListDataSource extends GraphQLDataSource {
	override readonly baseURL = "https://graphql.anilist.co";
	protected readonly token?: string;

	constructor({ token }: { token?: string } = {}) {
		super();
		this.token = token;
	}

	protected async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		if (this.token) request.headers.Authorization = this.token;
	}

	getAuthorizationUrl(clientId: string) {
		return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
	}

	async getGenres() {
		const data = await this.query<GenreCollection>(GET_GENRES);
		return data?.GenreCollection ?? [];
	}

	async getTags() {
		const data = await this.query<TagCollection>(GET_TAGS);
		return data?.MediaTagCollection ?? [];
	}

	async search(variables: AniListSearchInput) {
		const data = await this.query<MultiSearchResult>(MULTISEARCH, { variables });
		return Object.fromEntries(
			Object.entries(data ?? {}).map(([key, value]) => [
				key,
				{
					...value,
					results: value.results.map((result) => {
						switch (result.__typename) {
							case "Media":
								return this.mapMediaEntry(result);
							case "Character":
								return this.mapCharacterEntry(result);
							case "Staff":
								return this.mapStaffEntry(result);
							default:
								return result;
						}
					}),
				},
			]),
		) as unknown;
	}

	async browse(variables: InputMaybe<AniListBrowseInput> = {}) {
		const data = await this.query<{ Page: { pageInfo: PageInfo; media: Media[] } }>(BROWSE_MEDIA, { variables });
		const pageInfo = data?.Page?.pageInfo as PageInfo;

		return {
			pageInfo,
			media: data?.Page?.media.map(this.mapMediaEntry.bind(this)) ?? [],
		};
	}

	async getTrendingMedia() {
		return this.browse({ page: 1, sort: ["TRENDING_DESC", "POPULARITY_DESC"] });
	}

	async getMediaById(variables: AniListMediaInput) {
		const data = await this.query<{ Media: Media }>(GET_MEDIA, { variables });
		return this.mapMediaEntry(data?.Media);
	}

	async getCharacters(variables: AniListPageInput) {
		const data = await this.query<{ Media: Media }>(GET_CHARACTERS, { variables });
		const pageInfo = data?.Media?.characters?.pageInfo;
		const characters = this.mapMediaEntry(data?.Media ?? {}).characters ?? [];
		return { pageInfo, characters };
	}

	async getCharacterById(variables: AniListCharacterPageInput) {
		const data = await this.query<{ Character: Character }>(GET_CHARACTER_BY_ID, { variables });
		return this.mapCharacterEntry(data?.Character);
	}

	async getStaff(variables: AniListPageInput) {
		const data = await this.query<{ Media: Media }>(GET_STAFF, { variables });
		const pageInfo = data?.Media?.staff?.pageInfo;
		const staff = this.mapMediaEntry(data?.Media ?? {}).staff ?? [];
		return { pageInfo, staff };
	}

	async getStaffById(variables: AniListStaffMemberPageInput) {
		const data = await this.query<{ Staff: Staff }>(GET_STAFF_BY_ID, { variables });
		return this.mapStaffEntry(data?.Staff);
	}

	async getStudioById(variables: AniListPageInput) {
		const data = await this.query<{ Studio: Studio }>(GET_STUDIO_BY_ID, { variables });
		return this.mapStudioEntry(data?.Studio);
	}

	async getRecommendations(variables: AniListPageInput) {
		const data = await this.query<{ Media: Media }>(GET_RECOMMENDATIONS, { variables });
		const pageInfo = data?.Media?.recommendations?.pageInfo;
		const recommendations = this.mapMediaEntry(data?.Media ?? {}).recommendations ?? [];
		return { pageInfo, recommendations };
	}

	async getAiringSchedule(
		variables: InputMaybe<AniListAiringScheduleInput> = {
			start: startOfWeek(Date.now()).getTime(),
			end: endOfWeek(Date.now()).getTime(),
		},
	) {
		let page = 1;
		let hasNextPage = true;
		const schedule = [];
		while (hasNextPage) {
			const data = await this.query<{ Page: { pageInfo: PageInfo; airingSchedules: AiringSchedule[] } }>(
				GET_AIRING_SCHEDULE,
				{
					variables: {
						page,
						start: Math.floor(variables.start / 1000),
						end: Math.floor(variables.end / 1000),
					},
				},
			);

			const airingSchedules = (data?.Page?.airingSchedules ?? []).map((airingSchedule) => ({
				...airingSchedule,
				media: this.mapMediaEntry(airingSchedule.media),
			}));

			schedule.push(...airingSchedules);
			hasNextPage = !!data?.Page?.pageInfo?.hasNextPage;
			page++;
		}
		return schedule;
	}

	async getFullMediaListCollection() {}

	async getMediaListCollection() {}

	async saveMedia() {}

	async deleteMedia() {}

	async toggleFavorite() {}

	private mapMediaEntry(media: InputMaybe<Partial<Omit<Media, "__typename">>>) {
		if (!media) return {} as AniListMediaWithConnections;

		const mapBaseMediaEntry = (item: Partial<Omit<typeof media, "relations" | "characters" | "staff" | "studios">>) => {
			const { idMal, isAdult, externalLinks, ...rest } = item;

			const type = item.type === "ANIME" ? AniListMediaType.Anime : AniListMediaType.Manga;

			const rankings = (item.rankings ?? []).filter(Boolean).map((ranking) => {
				const formatted = [`#${ranking.rank} ${ranking.context}`];
				if (ranking.season) formatted.push(ranking.season);
				if (!ranking.allTime && ranking.year) formatted.push(ranking.year.toString());
				return { ...ranking, formatted: formatted.join(" ") };
			});

			const streams = (externalLinks ?? [])
				.filter((externalLink) => externalLink?.type === "STREAMING")
				.map((externalLink) => ({ name: externalLink.site, url: externalLink.url, iconUrl: externalLink.icon }));

			const trackers = [
				item.idMal
					? {
							name: "MyAnimeList",
							url: `https://myanimelist.net/${type.toLowerCase()}/${item.idMal}`,
						}
					: null,
				{
					name: "AniList",
					url: `https://anilist.co/${type.toLowerCase()}/${item.id}`,
				},
			].filter((tracker): tracker is NonNullable<typeof tracker> => !!tracker);

			return {
				...rest,
				type,
				rankings,
				streams,
				trackers,
				malId: idMal,
				isMature: Boolean(item.isAdult),
				isLicensed: Boolean(item.isLicensed),
				genres: item.genres ?? [],
				format: item.format?.replaceAll("_", " ") ?? null,
				status: item.status ? capitalize(item.status.replaceAll("_", " ").toLowerCase()) : null,
				season: item.season ? capitalize(item.season.toLowerCase()) : null,
				trailer: {
					id: item.trailer?.site === "youtube" ? item.trailer.id : null,
					url: item.trailer?.site === "youtube" ? `https://www.youtube.com/embed/${item.trailer.id}` : null,
				},
				nextAiringEpisode: {
					episode: item.nextAiringEpisode?.episode ?? null,
					airingAt: item.nextAiringEpisode?.airingAt ? item.nextAiringEpisode.airingAt * 1000 : null,
				},
			} as AniListMedia;
		};

		const relations = (media.relations?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;

				const media = mapBaseMediaEntry(edge.node);
				return { relationType: edge.relationType!, media };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<AniListMediaRelationsConnection>[];

		const recommendations = (media.recommendations?.nodes ?? [])
			.map((node) => {
				if (!node?.mediaRecommendation) return;

				const media = mapBaseMediaEntry(node.mediaRecommendation);
				return { id: node.id, rating: node.rating, media };
			})
			.filter((node): node is NonNullable<typeof node> => !!node) as Partial<Media>[];

		const characters = (media.characters?.edges ?? [])
			.map((edge) => {
				if (!edge?.node?.name) return;

				const character = this.mapCharacterEntry(edge.node);
				const voiceActors = (edge.voiceActors ?? [])
					.map((voiceActor) => {
						if (!voiceActor?.name) return;
						return this.mapStaffEntry(voiceActor);
					})
					.filter((voiceActor): voiceActor is NonNullable<typeof voiceActor> => !!voiceActor);
				return { role: edge.role!, character, voiceActors };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<AniListMediaCharactersConnection>[];

		const staff = (media.staff?.edges ?? [])
			.map((edge) => {
				if (!edge?.node?.name) return;

				const staff = this.mapStaffEntry(edge.node);
				return { role: edge.role!, staff };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<AniListMediaStaffConnection>[];

		const studios = (media.studios?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;
				return { isMain: edge.isMain, studio: edge.node };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<Media>[];

		return {
			...mapBaseMediaEntry(media),
			relations,
			recommendations,
			characters,
			staff,
			studios,
		} as AniListMediaWithConnections;
	}

	private mapCharacterEntry(character: InputMaybe<Partial<Omit<Character, "__typename">>>) {
		if (!character) return {} as AniListCharacterWithConnections;

		const media = (character.media?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;
				return {
					role: edge.characterRole,
					staff: (edge.voiceActorRoles ?? []).map((voiceActorRole) => this.mapStaffEntry(voiceActorRole.voiceActor)),
					media: this.mapMediaEntry(edge.node) as AniListMedia,
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<AniListCharacterMediaConnection>[];

		return {
			...character,
			name: character.name!.full!,
			image: character.image?.large ?? null,
			media: {
				pageInfo: character.media?.pageInfo,
				media,
			},
		} as AniListCharacterWithConnections;
	}

	private mapStaffEntry(staff: InputMaybe<Partial<Omit<Staff, "__typename">>>) {
		if (!staff) return {} as AniListStaffWithConnections;

		const { languageV2, characterMedia, staffMedia, ...rest } = staff;

		const characters = (characterMedia?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;

				return {
					role: edge.characterRole!,
					characters: (edge.characters ?? []).map(this.mapCharacterEntry.bind(this)),
					media: this.mapMediaEntry(edge.node),
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		const roles = (staffMedia?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;
				return { role: edge.staffRole!, media: this.mapMediaEntry(edge.node) };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge);

		return {
			...rest,
			name: staff.name!.full!,
			language: languageV2!,
			image: staff.image?.large ?? null,
			primaryOccupations: staff.primaryOccupations ?? [],
			voiceActing: {
				pageInfo: characterMedia?.pageInfo,
				characters,
			},
			production: {
				pageInfo: staffMedia?.pageInfo,
				roles,
			},
		} as AniListStaffWithConnections;
	}

	private mapStudioEntry(staff: InputMaybe<Partial<Omit<Studio, "__typename">>>) {
		if (!staff) return {} as AniListStudioWithConnections;

		const media = (staff.media?.edges ?? [])
			.map((edge) => {
				if (!edge?.node) return;
				return { isMainStudio: edge.isMainStudio, media: this.mapMediaEntry(edge.node) as AniListMedia };
			})
			.filter((edge): edge is NonNullable<typeof edge> => !!edge) as Partial<AniListStudioMediaConnection>;

		return {
			...staff,
			media: {
				pageInfo: staff.media?.pageInfo,
				media,
			},
		} as AniListStudioWithConnections;
	}
}
