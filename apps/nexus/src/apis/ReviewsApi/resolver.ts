import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		reviews: () => ({}) as ResolversTypes["Reviews"],
	},
	Reviews: {
		async search(_, { query }, { dataSources: { ReviewsDataSource } }) {
			return await ReviewsDataSource.search(query);
		},
		async review(_, { url }, { dataSources: { ReviewsDataSource } }) {
			return await ReviewsDataSource.loadReviewUrl(url);
		},
	},
} as Resolvers;
