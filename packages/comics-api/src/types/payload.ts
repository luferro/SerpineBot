export interface MangadexPayload<T> {
	data: T;
}

export interface MangadexSearch {
	id: number;
}

interface MangadexRelationship {
	id: string;
	type: string;
	related?: string;
	attributes: {
		description: string;
		volume: string;
		fileName: string;
	};
}
export interface MangadexChapter {
	id: string;
	attributes: {
		volume: string | null;
		chapter: string;
		title: string;
		externalUrl: string;
	};
	relationships: MangadexRelationship[];
}

export interface MangadexManga {
	id: string;
	attributes: {
		title: {
			'en': string;
			'ja': string;
			'jp': string;
			'ja-ro': string;
		};
	};
	relationships: MangadexRelationship[];
}
