import type { CatalogCategory } from './category';

export interface SteamResponse<T> {
	[key: string]: T;
}

export interface SteamId64 {
	steamid?: string;
}

interface SteamProfile {
	personaname: string;
	avatarfull: string;
	lastlogoff: number;
	personastate: number;
	timecreated: number;
}

export interface SteamPlayers {
	players: SteamProfile[];
}

interface SteamPackage {
	price: number;
	discount_pct: number;
}

export interface SteamWishlist {
	name: string;
	release_date: string | number;
	priority: number;
	is_free_game: boolean;
	subs: SteamPackage[];
}

interface SteamApp {
	appid: number;
	name: string;
	playtime_2weeks: number;
	playtime_forever: number;
}

export interface SteamRecentlyPlayed {
	total_count?: number;
	games?: SteamApp[];
}

export interface OpenCriticReview {
	name: string;
	datePublished: string;
	gamePlatform: string[];
	image: string;
	aggregateRating: {
		ratingValue: number;
		bestRating: number;
		worstRating: number;
		reviewCount: number;
		ratingCount: number;
	};
}

interface HowLongToBeatGame {
	game_id: number;
	game_name: string;
	game_alias: string;
	profile_summary: string;
	profile_dev: string;
	profile_pub: string;
	profile_genre: string;
	release_world: string;
	review_score: number;
	profile_steam: number;
	profile_ign: string;
	rating_esrb: string;
	game_image: string;
	comp_main: number;
	comp_plus: number;
	comp_100: number;
}

export interface HowLongToBeatResponse {
	props: {
		pageProps: {
			game: {
				data: {
					game: HowLongToBeatGame[];
				};
			};
		};
	};
}

export interface NintendoResponse {
	props: {
		pageProps: {
			initialApolloState: {
				[key: string]: {
					'__typename': string;
					'title': string;
					'media': {
						publicId: string;
					};
					'publishDate': string;
					'url({"relative":true})': string;
				};
			};
		};
	};
}

export interface SubscriptionCatalogEntry {
	name: string;
	slug: string;
	url: string | null;
}

export interface SubscriptionCatalogResponse {
	category: CatalogCategory;
	catalog: SubscriptionCatalogEntry[];
}
