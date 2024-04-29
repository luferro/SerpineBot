import { DealsApi, HLTBApi, IGDBApi, ReviewsApi, SubscriptionsApi } from "./games/index.js";
import { SteamApi, XboxApi } from "./platforms/index.js";

type Games = { hltb: HLTBApi; deals: DealsApi; reviews: ReviewsApi; subscriptions: SubscriptionsApi };
type Platforms = { steam: SteamApi; xbox: XboxApi };

type Options = {
	igdb: { clientId: string; clientSecret: string };
	deals: { apiKey: string };
	steam: { apiKey: string };
	xbox: { apiKey: string };
};

export class GamingApi {
	igdb: IGDBApi;
	games: Games;
	platforms: Platforms;

	constructor(options: Options) {
		this.igdb = new IGDBApi(options.igdb.clientId, options.igdb.clientSecret);
		this.games = {
			hltb: new HLTBApi(),
			deals: new DealsApi(options.deals.apiKey),
			reviews: new ReviewsApi(),
			subscriptions: new SubscriptionsApi(),
		};
		this.platforms = {
			steam: new SteamApi(options.steam.apiKey),
			xbox: new XboxApi(options.xbox.apiKey),
		};
	}
}
