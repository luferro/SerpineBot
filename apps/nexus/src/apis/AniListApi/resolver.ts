import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		aniList: () => ({}) as ResolversTypes["AniList"],
	},
	AniList: {
		async browse(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.browse(input);
		},
		async trending(_, __, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getTrendingMedia();
		},
		async search(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.search(input);
		},
		async genres(_, __, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getGenres();
		},
		async tags(_, __, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getTags();
		},
		async media(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getMediaById(input);
		},
		async recommendations(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getRecommendations(input);
		},
		async character(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getCharacterById(input);
		},
		async characters(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getCharacters(input);
		},
		async staffMember(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getStaffById(input);
		},
		async staffMembers(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getStaff(input);
		},
		async studio(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getStudioById(input);
		},
		async airingSchedule(_, { input }, { dataSources: { AniListDataSource } }) {
			return await AniListDataSource.getAiringSchedule(input);
		},
	},
} as Resolvers;
