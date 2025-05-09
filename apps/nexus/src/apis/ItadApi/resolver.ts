import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		itad: () => ({}) as ResolversTypes["Itad"],
	},
	Itad: {
		async search(_, { query }, { dataSources: { ItadDataSource } }) {
			return await ItadDataSource.search(query);
		},
		async deal(_, { input }, { dataSources: { ItadDataSource } }) {
			return await ItadDataSource.getDealsById(input);
		},
		async freebies(_, { country }, { dataSources: { ItadDataSource } }) {
			return await ItadDataSource.getFreebies(country);
		},
	},
} as Resolvers;
