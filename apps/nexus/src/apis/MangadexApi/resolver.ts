import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		mangadex: () => ({}) as ResolversTypes["Mangadex"],
	},
	Mangadex: {
		async search(_, { query }, { dataSources: { MangadexDataSource } }) {
			return await MangadexDataSource.search(query);
		},
		async manga(_, { id }, { dataSources: { MangadexDataSource } }) {
			return await MangadexDataSource.getMangaById(id);
		},
		async latestChapters(_, { limit }, { dataSources: { MangadexDataSource } }) {
			return await MangadexDataSource.getLatestChapters(limit);
		},
	},
} as Resolvers;
