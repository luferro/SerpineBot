import { DealsApi, HLTBApi, IGDBApi, ReviewsApi, SubscriptionsApi } from "./games";
import { SteamApi, XboxApi } from "./platforms";

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
		this.igdb = new IGDBApi(options.igdb);
		this.games = {
			hltb: new HLTBApi(),
			deals: new DealsApi(options.deals),
			reviews: new ReviewsApi(),
			subscriptions: new SubscriptionsApi(),
		};
		this.platforms = {
			steam: new SteamApi(options.steam),
			xbox: new XboxApi(options.xbox),
		};
	}
}
