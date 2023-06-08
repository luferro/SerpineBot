export type RecentlyPlayedEntry = { id: number; name: string; url: string; weeklyHours: number; totalHours: number };

export type WishlistEntry = {
	id: string;
	name: string;
	url: string;
	priority: number;
	discount: number | null;
	regular: string | null;
	discounted: string | null;
	free: boolean;
	released: boolean;
	sale: boolean;
	subscriptions: {
		xbox_game_pass: boolean;
		pc_game_pass: boolean;
		ubisoft_plus: boolean;
		ea_play_pro: boolean;
		ea_play: boolean;
	};
	notified: boolean;
};

export type XboxIntegration = { profile: { gamertag: string; gamerscore: number } };

export type SteamIntegration = {
	profile: { id: string; url: string };
	wishlist: WishlistEntry[];
	recentlyPlayed: RecentlyPlayedEntry[];
	notifications: boolean;
};
