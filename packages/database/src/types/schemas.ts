import type { Action, Integration, Webhook } from './enum';

export interface BaseSettings {
	guildId: string;
}

export interface GuildWebhook {
	category: Webhook;
	id: string;
	token: string;
	name: string;
}

export interface GuildMessage {
	category: Action;
	channelId: string;
	options?: string[];
}

export interface GuildSettings {
	messages: GuildMessage[];
	webhooks: GuildWebhook[];
}

export interface SteamWishlistEntry {
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

export interface SteamRecentlyPlayedEntry {
	id: number;
	name: string;
	url: string;
	weeklyHours: number;
	totalHours: number;
}

export interface BaseIntegration {
	userId: string;
	category: Integration;
}

export interface SteamIntegration {
	profile: {
		id: string;
		url: string;
	};
	wishlist: SteamWishlistEntry[];
	recentlyPlayed: SteamRecentlyPlayedEntry[];
	notifications: boolean;
}

export interface XboxIntegration {
	profile: {
		gamertag: string;
		gamerscore: number;
	};
}

export interface SubscriptionMatches {
	provider: string;
	entry: SubscriptionCatalogEntry;
}

export interface SubscriptionCatalogEntry {
	name: string;
	slug: string;
	url: string | null;
}

export interface Subscription {
	name: string;
	catalog: SubscriptionCatalogEntry[];
	count: number;
}

export interface Reminder {
	reminderId: string;
	userId: string;
	timeStart: number;
	timeEnd: number;
	message: string;
}

export interface Guild {
	id: string;
	name: string;
	icon: string;
	memberCount: number;
}

export interface StateEntry {
	title: string;
	url: string;
}

export interface State {
	job: string;
	entries: StateEntry[];
}

export interface Client {
	guilds: unknown[];
	commands: unknown[];
	state: State[];
}

export interface Birthday {
	userId: string;
	date: string;
}
