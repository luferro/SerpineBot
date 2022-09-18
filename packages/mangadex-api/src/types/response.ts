export interface MangadexResponse<T> {
	data: T[];
}

export interface SearchResult {
	id: number;
}

interface Relationship {
	id: string;
	type: string;
	related?: string;
	attributes: {
		description: string;
		volume: string;
		fileName: string;
	};
}

export interface Chapter {
	id: string;
	attributes: {
		volume: string | null;
		chapter: string;
		title: string;
		externalUrl: string;
	};
	relationships: Relationship[];
}

export interface Manga {
	data: {
		id: string;
		attributes: {
			title: {
				'en': string;
				'ja': string;
				'jp': string;
				'ja-ro': string;
			};
		};
		relationships: Relationship[];
	};
}
