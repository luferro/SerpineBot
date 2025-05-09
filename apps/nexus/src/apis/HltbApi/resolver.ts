import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		hltb: () => ({}) as ResolversTypes["Hltb"],
	},
	Hltb: {
		async search(_, { query }, { dataSources: { HltbDataSource } }) {
			return await HltbDataSource.search(query);
		},
		async playtimes(_, { id }, { dataSources: { HltbDataSource } }) {
			return await HltbDataSource.getPlaytimesById(id);
		},
	},
} as Resolvers;
