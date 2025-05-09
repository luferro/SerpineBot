import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		animeSchedule: () => ({}) as ResolversTypes["AnimeSchedule"],
	},
	AnimeSchedule: {
		async airingSchedule(_, { input }, { dataSources: { AnimeScheduleDataSource } }) {
			return await AnimeScheduleDataSource.getAiringSchedule(input);
		},
	},
} as Resolvers;
