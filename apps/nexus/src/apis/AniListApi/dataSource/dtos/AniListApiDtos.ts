export type PageInfo = {
	total: number;
	perPage: number;
	currentPage: number;
	lastPage: number;
	hasNextPage: boolean;
};

export type Media = {
	__typename: "Media";
	id: number;
	idMal: number;
	type: string;
	title: {
		romaji: string;
		english: string;
		native: string;
	};
	coverImage: {
		medium: string;
		large: string;
		extraLarge: string;
	};
	bannerImage: string;
	trailer: {
		id: string;
		site: string;
	};
	description: string;
	isAdult: boolean;
	format: string;
	status: string;
	source: string;
	isLicensed: boolean;
	countryOfOrigin: string;
	startDate: {
		day: string;
		month: string;
		year: string;
	};
	endDate: {
		day: string;
		month: string;
		year: string;
	};
	genres: string[];
	season: string;
	seasonYear: number;
	episodes: number;
	duration: number;
	nextAiringEpisode: {
		episode: number;
		airingAt: number;
	};
	volumes: number;
	chapters: number;
	popularity: number;
	averageScore: number;
	meanScore: number;
	rankings: {
		allTime: boolean;
		context: string;
		format: string;
		id: number;
		rank: number;
		season: string;
		type: string;
		year: number;
	}[];
	externalLinks: {
		type: string;
		site: string;
		url: string;
		icon: string;
	}[];
	relations: {
		edges: {
			relationType: string;
			node: Omit<Media, "relations" | "characters" | "staff" | "studios">;
		}[];
	};
	recommendations: {
		pageInfo: PageInfo;
		nodes: {
			id: number;
			rating: number;
			mediaRecommendation: Omit<Media, "relations" | "characters" | "staff" | "studios">;
		}[];
	};
	characters: {
		pageInfo: PageInfo;
		edges: {
			role: string;
			voiceActors: Staff[];
			node: Character;
		}[];
	};
	staff: {
		pageInfo: PageInfo;
		edges: {
			role: string;
			node: Staff;
		}[];
	};
	studios: {
		pageInfo: PageInfo;
		edges: {
			isMain: boolean;
			node: Studio;
		}[];
	};
};

export type Character = {
	__typename: "Character";
	id: number;
	name: {
		full: string;
	};
	image: {
		large: string;
	};
	description: string;
	age: string;
	gender: string;
	bloodType: string;
	dateOfBirth: {
		day: string;
		month: string;
		year: string;
	};
	media: {
		pageInfo: PageInfo;
		edges: {
			characterRole: string;
			voiceActorRoles: {
				voiceActor: Staff;
			}[];
			node: Media;
		}[];
	};
};

export type Staff = {
	__typename: "Staff";
	id: number;
	name: {
		full: string;
	};
	languageV2: string;
	image: {
		large: string;
	};
	description: string;
	age: number;
	gender: string;
	yearsActive: number[];
	homeTown: string;
	bloodType: string;
	primaryOccupations: string[];
	dateOfBirth: {
		day: string;
		month: string;
		year: string;
	};
	dateOfDeath: {
		day: string;
		month: string;
		year: string;
	};
	characterMedia: {
		pageInfo: PageInfo;
		edges: {
			characterRole: string;
			characters: Character[];
			node: Media;
		}[];
	};
	staffMedia: {
		pageInfo: PageInfo;
		edges: {
			staffRole: string;
			node: Media;
		}[];
	};
};

export type Studio = {
	__typename: "Studio";
	id: number;
	name: string;
	isAnimationStudio: boolean;
	media: {
		pageInfo: PageInfo;
		edges: {
			isMainStudio: boolean;
			node: Media;
		}[];
	};
};

export type MultiSearchResult = {
	anime: {
		pageInfo: PageInfo;
		results: Media[];
	};
	manga: {
		pageInfo: PageInfo;
		results: Media[];
	};
	characters: {
		pageInfo: PageInfo;
		results: Character[];
	};
	staff: {
		pageInfo: PageInfo;
		results: Staff[];
	};
	studios: {
		pageInfo: {
			total: number;
		};
		results: Studio[];
	};
};

export type GenreCollection = {
	GenreCollection: string[];
};

export type TagCollection = {
	MediaTagCollection: {
		name: string;
		description: string;
		category: string;
		isAdult: boolean;
	}[];
};

export type AiringSchedule = {
	id: number;
	episode: number;
	airingAt: number;
	media: Media;
};
