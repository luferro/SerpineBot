export interface Result {
	id: number | string;
}

export interface Results<T> {
	[key: string]: T[];
}

export interface Anime {
	data: {
		mal_id: number;
		title: string;
		title_english: string | null;
		url: string;
		season: string;
		year: number;
		broadcast: {
			day: string | null;
			time: string | null;
			timezone: string | null;
			string: string | null;
		};
		status: string;
		score: number;
		episodes: number;
		duration: string;
		images: {
			jpg: {
				large_image_url: string | null;
			};
		};
		trailer: {
			url: string | null;
		};
	};
}

interface Relationship {
	id: string;
	type: string;
	related?: string;
	attributes?: {
		description: string;
		volume: string;
		fileName: string;
	};
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

export interface Joke {
	joke?: string;
	setup?: string;
	delivery?: string;
}

interface Platform {
	id: number;
	name: string;
}

export interface Review {
	id: number;
	name: string;
	firstReleaseDate: string;
	bannerScreenshot: {
		fullRes: string;
	};
	numReviews: number;
	topCriticScore: number;
	tier: string;
	percentRecommended: number;
	Platforms: Platform[];
}

interface GalleryItem {
	media_id: string;
}

interface ChildrenItem {
	data: {
		title: string;
		selftext: string | null;
		url: string;
		permalink: string;
		secure_media?: {
			type: string;
		};
		gallery_data?: {
			items: GalleryItem[];
		};
		preview: {
			reddit_video_preview?: {
				fallback_url: string;
			};
		};
		is_self: boolean;
		crosspost_parent: boolean | null;
		stickied: boolean;
		is_video: boolean;
		removed_by_category: boolean | null;
		created_utc: number;
	};
}

export interface Post {
	data: {
		children: ChildrenItem[];
	};
}

interface Package {
	price: number;
	discount_pct: number;
}

export interface Wishlist {
	[key: string]: {
		name: string;
		release_date: string | number;
		priority: number;
		is_free_game: boolean;
		subs: Package[];
	};
}

export interface SteamId64 {
	response: {
		steamid?: string;
	};
}

interface SteamProfile {
	personaname: string;
	avatarfull: string;
	lastlogoff: number;
	personastate: number;
	timecreated: number;
}
export interface SteamProfiles {
	response: {
		players: SteamProfile[];
	};
}

interface SteamApp {
	appid: number;
	name: string;
	playtime_2weeks: number;
	playtime_forever: number;
}

export interface RecentlyPlayed {
	response: {
		total_count?: number;
		games?: SteamApp[];
	};
}

interface Genres {
	name: string;
}

export interface Movie {
	title: string;
	tagline: string;
	overview: string;
	homepage: string;
	release_date: string;
	poster_path: string;
	vote_average: number;
	runtime: number;
	genres: Genres[];
}

interface Season {
	name: string;
	episode_count: number;
	air_date: string;
}

export interface TV {
	name: string;
	tagline: string;
	overview: string;
	homepage: string;
	status: string;
	first_air_date: string;
	next_episode_to_air?: {
		air_date: string;
	};
	seasons: Season[];
	poster_path: string;
	vote_average: number;
	episode_run_time: number[];
	genres: Genres[];
}

interface ProviderDetails {
	provider_name: string;
}

interface Provider {
	link: string;
	flatrate?: ProviderDetails[];
	rent?: ProviderDetails[];
	buy?: ProviderDetails[];
}

export interface Providers {
	results: {
		PT?: Provider;
	};
}

interface Snippet {
	snippet: {
		channelId: string;
	};
}

export interface Video {
	items: Snippet[];
}

interface Statistics {
	statistics: {
		subscriberCount: string;
	};
}

export interface Channel {
	items?: Statistics[];
}

export interface Gif {
	itemurl: string;
}

export interface Article {
	source: {
		name: string | null;
	};
	author: string | null;
	title: string;
	description: string;
	content: string;
	url: string;
	urlToImage: string | null;
	publishedAt: string;
}
