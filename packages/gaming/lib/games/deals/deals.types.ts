export type List<T> = { list: T };

export type Result = { id: string; title: string }[];

type Entry = { id: number; name: string };
type Price = { amount: number; currency: string };

export type Game = { id: string; slug: string; title: string; mature: boolean };

export type Bundle = {
	id: number;
	title: string;
	page: Entry;
	url: string;
	details: string;
	isMature: boolean;
	publish: string;
	expiry: string | null;
	counts: { games: number; media: number };
	tiers: { price: Price; games: Game[] }[];
};

export type HistoricalLow = Pick<Deal, "shop" | "price" | "regular" | "cut" | "timestamp">;

export type Deal = {
	shop: Entry;
	price: Price;
	regular: Price;
	cut: number;
	voucher: string | null;
	drm: Entry[];
	platforms: Entry[];
	timestamp: string;
	expiry: string | null;
	url: string;
};
