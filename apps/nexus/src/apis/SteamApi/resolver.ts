import type { Resolvers, ResolversTypes } from "~/model/schema.generated.js";

export default {
	Query: {
		steam: () => ({}) as ResolversTypes["Steam"],
	},
	Steam: {
		async search(_, { query }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.search(query);
		},
		async steamId64(_, { vanityUrl }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getSteamId64(vanityUrl);
		},
		async profile(_, { steamId64 }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getProfile(steamId64);
		},
		async recentlyPlayed(_, { steamId64 }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getRecentlyPlayed(steamId64);
		},
		async wishlist(_, { steamId64 }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getWishlist(steamId64);
		},
		async playerCount(_, { appId }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getPlayerCount(appId);
		},
		async store(_, { appIds }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getStoreApps(appIds);
		},
		async upcomingSales(_, __, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getUpcomingSales();
		},
		async chart(_, { chart }, { dataSources: { SteamDataSource } }) {
			return await SteamDataSource.getChart(chart);
		},
	},
} as Resolvers;
