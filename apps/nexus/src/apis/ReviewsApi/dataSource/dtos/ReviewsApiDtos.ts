export type MetacriticReview = {
	name: string;
	dateCreated: string;
	datePublished: string;
	description: string;
	contentRating: string;
	image: string;
	url: string;
	genre: string;
	gamePlatform: string[];
	aggregateRating: {
		name: string;
		description: string;
		bestRating: number;
		worstRating: number;
		ratingValue: number;
		reviewCount: number;
		url: string;
	};
	trailer: {
		name: string;
		description: string;
		thumbnailUrl: string;
		uploadDate: string;
	} | null;
	screenshot: {
		caption: string;
		thumbnailUrl?: string;
		contentUrl?: string;
	}[];
	publisher: {
		name: string;
	}[];
};

export type OpencriticReview = {
	url: string;
	dateCreated: string;
	name: string;
	gamePlatform: string[];
	description: string;
	operatingSystem: string[];
	genre: string[];
	datePublished: string;
	image: string;
	dateModified: string;
	screenshot: {
		caption: string;
		thumbnailUrl?: string;
		contentUrl?: string;
	}[];
	trailer: {
		name: string;
		url: string;
		uploadDate: string;
		thumbnailUrl: string;
		description: string;
		embedUrl: string;
	} | null;
	author: {
		name: string;
	}[];
	publisher: {
		name: string;
	}[];
	aggregateRating: {
		ratingValue: number;
		bestRating: number;
		worstRating: number;
		reviewCount: number;
		ratingCount: number;
		name: string;
		description: string;
	};
};
