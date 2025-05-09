import type { BaseContext } from "@luferro/graphql/server";
import type { FastifyRequest } from "fastify";

import { AniListDataSource } from "./apis/AniListApi/dataSource/AniListDataSource.js";
import { AnimeScheduleDataSource } from "./apis/AnimeScheduleApi/dataSource/AnimeScheduleDataSource.js";
import { HltbDataSource } from "./apis/HltbApi/dataSource/HltbDataSource.js";
import { IgdbDataSource } from "./apis/IgdbApi/dataSource/IgdbDataSource.js";
import { ItadDataSource } from "./apis/ItadApi/dataSource/ItadDataSource.js";
import { MangadexDataSource } from "./apis/MangadexApi/dataSource/MangadexDataSource.js";
import { RedditDataSource } from "./apis/RedditApi/dataSource/RedditDataSource.js";
import { ReviewsDataSource } from "./apis/ReviewsApi/dataSource/ReviewsDataSource.js";
import { SteamDataSource } from "./apis/SteamApi/dataSource/SteamDataSource.js";
import { TmdbDataSource } from "./apis/TmdbApi/dataSource/TmdbDataSource.js";

export interface Context extends BaseContext {
	token: string;
	dataSources: {
		AniListDataSource: AniListDataSource;
		AnimeScheduleDataSource: AnimeScheduleDataSource;
		HltbDataSource: HltbDataSource;
		IgdbDataSource: IgdbDataSource;
		ItadDataSource: ItadDataSource;
		MangadexDataSource: MangadexDataSource;
		RedditDataSource: RedditDataSource;
		ReviewsDataSource: ReviewsDataSource;
		SteamDataSource: SteamDataSource;
		TmdbDataSource: TmdbDataSource;
	};
	currentDate: Date;
}

function getCredentials(req: FastifyRequest) {
	const authorizationHeader = req.headers.authorization ?? "";
	if (authorizationHeader.startsWith("Basic")) {
		const base64Credentials = authorizationHeader.split(" ")[1];
		const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
		const [clientId, clientSecret] = credentials.split(":");
		return { token: authorizationHeader, clientId, clientSecret };
	}
	return { token: authorizationHeader, clientId: "", clientSecret: "" };
}

export const getContext = (req: FastifyRequest): Context => {
	const { clientId, clientSecret, token } = getCredentials(req);

	return {
		token,
		dataSources: {
			AniListDataSource: new AniListDataSource(),
			AnimeScheduleDataSource: new AnimeScheduleDataSource({ token }),
			HltbDataSource: new HltbDataSource(),
			IgdbDataSource: new IgdbDataSource({ clientId, clientSecret }),
			ItadDataSource: new ItadDataSource({ token }),
			MangadexDataSource: new MangadexDataSource({ token }),
			RedditDataSource: new RedditDataSource({ clientId, clientSecret }),
			ReviewsDataSource: new ReviewsDataSource(),
			SteamDataSource: new SteamDataSource({ token }),
			TmdbDataSource: new TmdbDataSource({ token }),
		},
		currentDate: new Date(),
	};
};
