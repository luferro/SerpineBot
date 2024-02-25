export type Payload<T> = { data: T };

export type Relationship<T = unknown> = { id: string; type: "manga" | "cover_art"; attributes: T };

export type Chapter = {
	id: string;
	attributes: {
		volume: string | null;
		chapter: string;
		title: string;
		externalUrl: string;
		publishedAt: string;
		readableAt: string;
	};
	relationships: Relationship[];
};

export type Manga = {
	id: string;
	attributes: {
		title: { en: string; ja: string; jp: string; "ja-ro": string };
		status: string;
		year: number;
		tags: { attributes: { name: { en: string } } }[];
	};
	relationships: Relationship<{ fileName: string }>[];
};
