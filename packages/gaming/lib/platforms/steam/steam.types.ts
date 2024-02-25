export enum Chart {
	TOP_SELLERS = 0,
	TOP_PLAYED = 1,
	UPCOMING_GAMES = 2,
}

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
	name: string;
	release_date: string | number;
	priority: number;
	is_free_game: boolean;
	subs: { id: number; discount_block: string; price: number; discount_pct: number | null }[];
};

export type RecentlyPlayed = {
	appid: number;
	name: string;
	playtime_2weeks: number;
	playtime_forever: number;
};
