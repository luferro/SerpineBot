import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		reddit: () => ({}) as ResolversTypes["Reddit"],
	},
	Reddit: {
		async posts(_, { input }, { dataSources: { RedditDataSource } }) {
			return await RedditDataSource.getPosts(input);
		},
	},
} as Resolvers;
