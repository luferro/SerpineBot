import { ApiKey } from '../../types/args';
import { DealsApi, HLTBApi, ReviewsApi, SubscriptionsApi } from './games';
import { SteamApi, XboxApi } from './platforms';

export type Config = { igdb: { clientId: string; clientSecret: string }; deals: ApiKey; steam: ApiKey; xbox: ApiKey };

export type Games = { hltb: HLTBApi; deals: DealsApi; reviews: ReviewsApi; subscriptions: SubscriptionsApi };

export type Platforms = { steam: SteamApi; xbox: XboxApi };
