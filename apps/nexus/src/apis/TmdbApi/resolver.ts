import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		tmdb: () => ({}) as ResolversTypes["Tmdb"],
	},
	Tmdb: {
		async search(_, { query }, { dataSources: { TmdbDataSource } }) {
			return await TmdbDataSource.search(query);
		},
		async movie(_, { input }, { dataSources: { TmdbDataSource } }) {
			return await TmdbDataSource.getMovieById(input);
		},
		async series(_, { input }, { dataSources: { TmdbDataSource } }) {
			return await TmdbDataSource.getSeriesById(input);
		},
	},
} as Resolvers;
