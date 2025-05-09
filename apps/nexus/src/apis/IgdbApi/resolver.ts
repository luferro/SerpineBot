import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		igdb: () => ({}) as ResolversTypes["Igdb"],
	},
	Igdb: {
		async search(_, { query }, { dataSources: { IgdbDataSource } }) {
			return await IgdbDataSource.search(query);
		},
		async upcomingEvents(_, __, { dataSources: { IgdbDataSource } }) {
			return await IgdbDataSource.getUpcomingEvents();
		},
	},
} as Resolvers;
