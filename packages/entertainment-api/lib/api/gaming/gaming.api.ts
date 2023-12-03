import { ApiKey } from '../../types/args';
import { DealsApi, HLTBApi, IGDBApi, ReviewsApi, SubscriptionsApi } from './games';
import { SteamApi, XboxApi } from './platforms';

type Config = { igdb: { clientId: string; clientSecret: string }; deals: ApiKey; steam: ApiKey; xbox: ApiKey };

type Games = { hltb: HLTBApi; deals: DealsApi; reviews: ReviewsApi; subscriptions: SubscriptionsApi };
type Platforms = { steam: SteamApi; xbox: XboxApi };

export class GamingApi {
	igdb: IGDBApi;
	games: Games;
	platforms: Platforms;

	constructor(config: Config) {
		this.igdb = new IGDBApi(config.igdb);
		this.games = {
			hltb: new HLTBApi(),
			deals: new DealsApi(config.deals),
			reviews: new ReviewsApi(),
			subscriptions: new SubscriptionsApi(),
		};
		this.platforms = {
			steam: new SteamApi(config.steam),
			xbox: new XboxApi(config.xbox),
		};
	}
}
