export interface Birthday {
	userId: string;
	date: string;
}

export interface Reminder {
	reminderId: string;
	userId: string;
	timeStart: number;
	timeEnd: number;
	message: string;
}

interface Webhook {
	id: string;
	token: string;
	name: string;
}

export interface Settings {
	guildId: string;
	roles: {
		channelId: string | null;
		options: string[];
	};
	birthdays: {
		channelId: string | null;
	};
	leaderboards: {
		steam: {
			channelId: string | null;
		};
		xbox: {
			channelId: string | null;
		};
	};
	webhooks: Webhook[];
}

interface Entry {
	title: string;
	url: string;
}

export interface State {
	category: string;
	entries: Map<string, Entry[]>;
}

export interface SteamWishlistItem {
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
}

interface SteamRecentlyPlayedItem {
	id: number;
	name: string;
	url: string;
	weeklyHours: number;
	totalHours: number;
}

export interface Steam {
	userId: string;
	profile: {
		id: string;
		url: string;
	};
	wishlist: SteamWishlistItem[];
	recentlyPlayed: SteamRecentlyPlayedItem[];
	notifications: boolean;
}

export interface Xbox {
	userId: string;
	profile: {
		gamertag: string;
		gamerscore: number;
	};
}

interface CatalogItem {
	name: string;
	slug: string;
	url: string | null;
}

export interface Subscriptions {
	name: string;
	catalog: CatalogItem[];
	count: number;
}

export interface SubscriptionsAggregate {
	_id: string;
	entry: CatalogItem;
}
