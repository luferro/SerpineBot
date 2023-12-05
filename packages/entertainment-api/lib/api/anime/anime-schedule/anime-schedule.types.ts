export type Streams = {
	crunchyroll: string;
	funimation: string;
	wakanim: string;
	amazon: string;
	hidive: string;
	hulu: string;
	youtube: string;
	netflix: string;
};

export type Trackers = { mal: string; aniList: string; kitsu: string; animePlanet: string; anidb: string };

export type Websites = { official: string } & Streams & Trackers;

export type Anime = {
	title: string;
	names: { romaji: string; english: string; native: string; abbreviation: string };
	route: string;
	premier: string;
	season: { title: string };
	description: string;
	genres: { name: string; route: string }[];
	studios: { name: string; route: string }[];
	sources: { name: string; route: string }[];
	episodes: number;
	lengthMin: number;
	status: string;
	imageVersionRoute: string;
	stats: { averageScore: number };
	websites: Websites;
};

export type Schedule = {
	title: string;
	romaji: string;
	english: string;
	native: string;
	route: string;
	delayedFrom: string;
	delayedUntil: string;
	status: string;
	episodeDate: string;
	episodeNumber: number;
	episodes: number;
	lengthMin: number;
	imageVersionRoute: string;
	streams: Streams;
	airingStatus: string;
};
