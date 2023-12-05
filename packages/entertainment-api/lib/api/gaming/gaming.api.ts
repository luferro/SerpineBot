import { DealsApi, HLTBApi, IGDBApi, ReviewsApi, SubscriptionsApi } from './games';
import { Config, Games, Platforms } from './gaming.types';
import { SteamApi, XboxApi } from './platforms';

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
