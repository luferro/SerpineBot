export type Payload<T> = { data: T };

export type Game<T> = { [key: string]: T };

export type List<T> = { list: T };

export type Result = { results: { id: number; plain: string; title: string }[] };

export type HistoricalLow = {
	shop?: { id: string; name: string };
	price?: number;
	cut?: number;
	added?: number;
};

type Bundle = { title: string; bundle: string; start: number; expiry: number | null; url: string };
export type Bundles = { total: number } & List<Bundle[]>;

export type Price = {
	shop: { id: string; name: string };
	price_new: number;
	price_old: number;
	price_cut: string;
	url: string | null;
	drm: string[];
};

export type Deal = {
	plain: string;
	title: string;
	price_new: number;
	price_old: number;
	price_cut: number;
	added: number;
	expiry: number;
	drm: string[];
	shop: { id: string; name: string };
	urls: { buy: string; game: string };
};
