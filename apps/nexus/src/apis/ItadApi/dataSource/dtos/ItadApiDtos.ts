type Price = {
	amount: number;
	amountInt: number;
	currency: string;
};

type Entity = {
	id: number;
	name: string;
};

type Game = {
	id: string;
	slug: string;
	title: string;
	type: string | null;
	mature: boolean;
};

type Deal = {
	shop: Entity;
	price: Price;
	regular: Price;
	cut: number;
	voucher: string | null;
	storeLow: Price | null;
	flag: "H" | "N" | "S";
	drm: Entity[];
	platforms: Entity[];
	timestamp: string;
	expiry: string | null;
	url: string;
};

export type Result = Pick<Game, "id" | "title">[];

export type Info = Game & {
	assets: {
		boxart: string;
		banner145: string;
		banner300: string;
		banner400: string;
		banner600: string;
	};
	earlyAccess: boolean;
	achievements: boolean;
	tradingCards: boolean;
	appid: number;
	tags: string[];
	releaseDate: string;
	developers: Entity[];
	publishers: Entity[];
	reviews: {
		score: number;
		source: string;
		count: number;
		url: string;
	}[];
	players: {
		recent: number;
		day: number;
		week: number;
		peak: number;
	};
};

export type HistoryLow = {
	all: Price | null;
	y1: Price | null;
	m3: Price | null;
};

export type Bundle = {
	id: number;
	title: string;
	page: {
		id: number;
		name: string;
		shopId: number | null;
	};
	url: string;
	details: string;
	isMature: boolean;
	publish: string;
	expiry: string | null;
	counts: {
		games: number;
		media: number;
	};
	tiers: {
		price: Price | null;
		games: Game[];
	}[];
};

export type GamePrice = {
	id: string;
	historyLow: HistoryLow;
	deals: Deal[];
};

export type DealsList = {
	list: (Game & { deal: Deal })[];
};
