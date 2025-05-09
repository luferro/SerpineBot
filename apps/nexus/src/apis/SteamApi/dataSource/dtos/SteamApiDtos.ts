export enum Status {
	Offline = 0,
	Online = 1,
	Busy = 2,
	Away = 3,
	Snooze = 4,
	LookingToTrade = 5,
	LookingToPlay = 6,
}

export type Payload<T> = { [key: string]: T };

export type Profile = {
	personaname: string;
	avatarfull: string;
	lastlogoff: number;
	personastate: number;
	timecreated: number;
};

export type Wishlist = {
	appid: number;
	priority: number;
	date_added: number;
};

export type RecentlyPlayed = {
	appid: number;
	name: string;
	playtime_2weeks: number;
	playtime_forever: number;
};

export type StoreApp = {
	id: number;
	appid: number;
	name: string;
	store_url_path: string;
	is_free?: boolean;
	basic_info: {
		short_description: string;
		publishers: { name: string }[];
		developers: { name: string }[];
		franchises?: { name: string }[];
	};
	assets: {
		asset_url_format: string;
		main_capsule: string;
		small_capsule: string;
		header: string;
		page_background: string;
		hero_capsule: string;
		library_capsule: string;
		library_capsule_2x: string;
		library_hero: string;
		library_hero_2x: string;
		community_icon: string;
	};
	release: {
		steam_release_date?: number;
		is_coming_soon?: boolean;
		custom_release_date_message?: string;
		coming_soon_display?: "date_month" | "date_year" | "date_full" | "text_comingsoon" | "text_tba";
	};
	best_purchase_option?: {
		packageid: number;
		purchase_option_name: string;
		original_price_in_cents?: string;
		formatted_original_price?: string;
		final_price_in_cents: string;
		formatted_final_price: string;
		discount_pct?: number;
		active_discounts: { discount_amount: string; discount_end_date: number }[];
		user_can_purchase_as_gift: boolean;
		included_game_count: number;
	};
	screenshots?: {
		all_ages_screenshots?: { filename: string }[];
	};
	trailers?: {
		highlights?: {
			trailer_name: string;
			trailer_url_format: string;
			trailer_480p: { filename: string; type: string }[];
			trailer_max: { filename: string; type: string }[];
			screenshot_medium: string;
			screenshot_full: string;
		}[];
	};
};
