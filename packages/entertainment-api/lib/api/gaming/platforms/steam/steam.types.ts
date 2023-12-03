export enum Chart {
	TOP_SELLERS,
	TOP_PLAYED,
	UPCOMING_GAMES,
}

export enum Status {
	Offline,
	Online,
	Busy,
	Away,
	Snooze,
	LookingToTrade,
	LookingToPlay,
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
	name: string;
	release_date: string | number;
	priority: number;
	is_free_game: boolean;
	subs: { id: number; discount_block: string; price: number; discount_pct: number }[];
};

export type RecentlyPlayed = {
	appid: number;
	name: string;
	playtime_2weeks: number;
	playtime_forever: number;
};
