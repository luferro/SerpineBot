import { FetchUtil } from '@luferro/shared-utils';

type Streams = {
	crunchyroll: string;
	funimation: string;
	wakanim: string;
	amazon: string;
	hidive: string;
	hulu: string;
	youtube: string;
	netflix: string;
};
type Trackers = { mal: string; aniList: string; kitsu: string; animePlanet: string; anidb: string };
type Websites = { official: string } & Streams & Trackers;

type Anime = {
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

type Schedule = {
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

export type WeeklySchedule = Awaited<ReturnType<typeof getWeeklySchedule>>;

let API_KEY: string | null = null;

const validateApiKey = () => {
	if (!API_KEY) throw new Error('AnimeSchedule API key is not set.');
};

export const setApiKey = (apiKey: string) => (API_KEY = apiKey);

export const getAnimeById = async (id: string) => {
	validateApiKey();

	const { payload } = await FetchUtil.fetch<Anime>({
		url: `https://animeschedule.net/api/v3/anime/${id}`,
		authorization: API_KEY!,
	});

	const { mal, aniList, animePlanet, kitsu } = payload.websites;
	const isTracker = (url: string) => [mal, aniList, animePlanet, kitsu].includes(url);

	const { crunchyroll, funimation, hidive, netflix, youtube, wakanim, hulu, amazon } = payload.websites;
	const isStream = (url: string) =>
		[crunchyroll, funimation, hidive, netflix, youtube, wakanim, hulu, amazon].includes(url);

	const trackers = Object.entries(payload.websites)
		.filter(({ 1: url }) => isTracker(url))
		.map(([tracker, url]) => ({ tracker, url: `https://${url}` }));

	const streams = Object.entries(payload.websites)
		.filter(({ 1: url }) => isStream(url))
		.map(([tracker, url]) => ({ tracker, url: `https://${url}` }));

	return {
		titles: { default: payload.title, alternative: payload.names.english },
		url: payload.websites.official ?? `https://animeschedule.net/anime/${payload.route}`,
		image: `https://img.animeschedule.net/production/assets/public/img/${payload.imageVersionRoute}`,
		premier: payload.premier,
		score: payload.stats.averageScore > 0 ? Math.round(payload.stats.averageScore) / 10 : null,
		description: payload.description,
		status: payload.status,
		season: payload.season.title,
		episodes: {
			total: payload.episodes,
			duration: payload.lengthMin,
		},
		genres: payload.genres.map(({ name }) => name),
		studios: payload.studios.map(({ name }) => name),
		sources: payload.sources.map(({ name }) => name),
		trackers,
		streams,
	};
};

export const getWeeklySchedule = async () => {
	validateApiKey();

	const { payload } = await FetchUtil.fetch<Schedule[]>({
		url: 'https://animeschedule.net/api/v3/timetables/sub?tz=UTC',
		authorization: API_KEY!,
	});

	return payload
		.map((anime) => {
			if (anime.airingStatus === 'delayed-air') return;

			const streams = Object.entries(anime.streams).map(([stream, url]) => ({ stream, url: `https://${url}` }));

			return {
				id: anime.route,
				titles: { default: anime.title, alternative: anime.english },
				url: `https://animeschedule.net/anime/${anime.route}`,
				image: `https://img.animeschedule.net/production/assets/public/img/${anime.imageVersionRoute}`,
				status: anime.status,
				episodes: {
					total: anime.episodes,
					duration: anime.lengthMin,
					current: { number: anime.episodeNumber, date: anime.episodeDate },
					delay: {
						from: anime.delayedFrom !== '0001-01-01T00:00:00Z' ? anime.delayedFrom : null,
						until: anime.delayedUntil !== '0001-01-01T00:00:00Z' ? anime.delayedUntil : null,
					},
				},
				streams,
				hasAired: anime.airingStatus === 'aired',
				isAiring: anime.airingStatus === 'airing',
				isDelayed: anime.airingStatus === 'delayed-air',
			};
		})
		.filter((anime): anime is NonNullable<typeof anime> => !!anime);
};
