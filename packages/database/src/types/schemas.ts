import type { IntegrationEnum, MessageEnum, WebhookEnum } from './enum';

export interface BaseSettings {
	guildId: string;
}

export interface Webhook {
	category: WebhookEnum;
	id: string;
	token: string;
	name: string;
}

export interface Message {
	category: MessageEnum;
	channelId: string;
	options?: string[];
}

export interface GuildSettings {
	messages: Message[];
	webhooks: Webhook[];
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
	category: IntegrationEnum;
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
	name: string;
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
	jobName: string;
	entries: Map<string, StateEntry[]>;
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
