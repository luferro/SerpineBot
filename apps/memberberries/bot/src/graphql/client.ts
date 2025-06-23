import { loadConfig } from "@luferro/config";
import { GraphQLClient, InMemoryCache, skipCache, withTTL } from "@luferro/graphql/client";
import type * as GraphQLTypes from "~/graphql/__generated__/graphql.js";
import { GET_IGDB_UPCOMING_EVENTS } from "~/graphql/queries/igdb.qry.js";
import { GET_HLTB_PLAYTIMES, SEARCH_HLTB } from "./queries/hltb.qry.js";
import { GET_ITAD_DEAL, GET_ITAD_FREEBIES, SEARCH_ITAD } from "./queries/itad.qry.js";
import { GET_REDDIT_POSTS } from "./queries/reddit.qry.js";
import { GET_REVIEW, SEARCH_REVIEW } from "./queries/reviews.qry.js";
import {
	GET_STEAM_CHART,
	GET_STEAM_ID_64,
	GET_STEAM_PROFILE,
	GET_STEAM_RECENTLY_PLAYED,
	GET_STEAM_UPCOMING_SALES,
	GET_STEAM_WISHLIST,
} from "./queries/steam.qry.js";

export class ExtendedGraphQLClient extends GraphQLClient {
	constructor(uri: string) {
		super({
			uri,
			cache: new InMemoryCache({
				typePolicies: {
					Query: {
						fields: {
							hltb: withTTL(),
							igdb: withTTL(),
							itad: withTTL(),
							reddit: skipCache(),
							reviews: skipCache(),
							steam: skipCache(),
						},
					},
				},
			}),
		});
	}

	override createServicesContext() {
		const config = loadConfig();

		return {
			igdb: `Basic ${Buffer.from(`${config.get("services.igdb.clientId")}:${config.get("services.igdb.clientSecret")}`).toString("base64")}`,
			itad: config.get("services.itad.apiKey"),
			reddit: `Basic ${Buffer.from(`${config.get("services.reddit.clientId")}:${config.get("services.reddit.clientSecret")}`).toString("base64")}`,
			steam: config.get("services.steam.apiKey"),
		};
	}

	get hltb() {
		return {
			search: this.createQueryMethod<
				GraphQLTypes.SearchHltbQuery,
				GraphQLTypes.SearchHltbQueryVariables,
				GraphQLTypes.SearchHltbQuery["hltb"]["search"]
			>("hltb", SEARCH_HLTB, (data) => data.hltb.search),
			getPlaytimes: this.createQueryMethod<
				GraphQLTypes.GetHltbPlaytimesQuery,
				GraphQLTypes.GetHltbPlaytimesQueryVariables,
				GraphQLTypes.GetHltbPlaytimesQuery["hltb"]["playtimes"]
			>("hltb", GET_HLTB_PLAYTIMES, (data) => data.hltb.playtimes),
		};
	}

	get igdb() {
		return {
			getUpcomingEvents: this.createQueryMethod<
				GraphQLTypes.GetIgdbUpcomingEventsQuery,
				GraphQLTypes.GetIgdbUpcomingEventsQueryVariables,
				GraphQLTypes.IgdbGamingEvent[]
			>("igdb", GET_IGDB_UPCOMING_EVENTS, (data) => data.igdb.upcomingEvents),
		};
	}

	get itad() {
		return {
			search: this.createQueryMethod<
				GraphQLTypes.SearchItadQuery,
				GraphQLTypes.SearchItadQueryVariables,
				GraphQLTypes.SearchItadQuery["itad"]["search"]
			>("itad", SEARCH_ITAD, (data) => data.itad.search),
			getDealsById: this.createQueryMethod<
				GraphQLTypes.GetItadDealQuery,
				GraphQLTypes.GetItadDealQueryVariables,
				GraphQLTypes.GetItadDealQuery["itad"]["deal"]
			>("itad", GET_ITAD_DEAL, (data) => data.itad.deal),
			getFreebies: this.createQueryMethod<
				GraphQLTypes.GetItadFreebiesQuery,
				GraphQLTypes.GetItadFreebiesQueryVariables,
				GraphQLTypes.GetItadFreebiesQuery["itad"]["freebies"]
			>("itad", GET_ITAD_FREEBIES, (data) => data.itad.freebies),
		};
	}

	get reddit() {
		return {
			getPosts: this.createQueryMethod<
				GraphQLTypes.GetRedditPostsQuery,
				GraphQLTypes.GetRedditPostsQueryVariables,
				GraphQLTypes.GetRedditPostsQuery["reddit"]["posts"]
			>("reddit", GET_REDDIT_POSTS, (data) => data.reddit.posts),
		};
	}

	get reviews() {
		return {
			search: this.createQueryMethod<
				GraphQLTypes.SearchReviewQuery,
				GraphQLTypes.SearchReviewQueryVariables,
				GraphQLTypes.SearchReviewQuery["reviews"]["search"]
			>("reviews", SEARCH_REVIEW, (data) => data.reviews.search),
			getReview: this.createQueryMethod<
				GraphQLTypes.GetReviewQuery,
				GraphQLTypes.GetReviewQueryVariables,
				GraphQLTypes.GetReviewQuery["reviews"]["review"]
			>("reviews", GET_REVIEW, (data) => data.reviews.review),
		};
	}

	get steam() {
		return {
			getSteamId64: this.createQueryMethod<
				GraphQLTypes.GetSteamId64Query,
				GraphQLTypes.GetSteamId64QueryVariables,
				GraphQLTypes.GetSteamId64Query["steam"]["steamId64"]
			>("steam", GET_STEAM_ID_64, (data) => data.steam.steamId64),
			getProfile: this.createQueryMethod<
				GraphQLTypes.GetSteamProfileQuery,
				GraphQLTypes.GetSteamProfileQueryVariables,
				GraphQLTypes.GetSteamProfileQuery["steam"]["profile"]
			>("steam", GET_STEAM_PROFILE, (data) => data.steam.profile),
			getWishlist: this.createQueryMethod<
				GraphQLTypes.GetSteamWishlistQuery,
				GraphQLTypes.GetSteamWishlistQueryVariables,
				GraphQLTypes.GetSteamWishlistQuery["steam"]["wishlist"]
			>("steam", GET_STEAM_WISHLIST, (data) => data.steam.wishlist),
			getRecentlyPlayed: this.createQueryMethod<
				GraphQLTypes.GetSteamRecentlyPlayedQuery,
				GraphQLTypes.GetSteamRecentlyPlayedQueryVariables,
				GraphQLTypes.GetSteamRecentlyPlayedQuery["steam"]["recentlyPlayed"]
			>("steam", GET_STEAM_RECENTLY_PLAYED, (data) => data.steam.recentlyPlayed),
			getUpcomingSales: this.createQueryMethod<
				GraphQLTypes.GetSteamUpcomingSalesQuery,
				GraphQLTypes.GetSteamUpcomingSalesQueryVariables,
				GraphQLTypes.GetSteamUpcomingSalesQuery["steam"]["upcomingSales"]
			>("steam", GET_STEAM_UPCOMING_SALES, (data) => data.steam.upcomingSales),
			getChart: this.createQueryMethod<
				GraphQLTypes.GetSteamChartQuery,
				GraphQLTypes.GetSteamChartQueryVariables,
				GraphQLTypes.GetSteamChartQuery["steam"]["chart"]
			>("steam", GET_STEAM_CHART, (data) => data.steam.chart),
		};
	}
}
