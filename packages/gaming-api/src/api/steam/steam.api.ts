import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';

import { Endpoint, getChartsList, getSalesList, getSteamList } from './steam.scraper';

enum Status {
	Offline,
	Online,
	Busy,
	Away,
	Snooze,
	LookingToTrade,
	LookingToPlay,
}

type Payload<T> = { [key: string]: T };

type SteamId64 = { steamid?: string };

type Profile = {
	personaname: string;
	avatarfull: string;
	lastlogoff: number;
	personastate: number;
	timecreated: number;
};

type Package = { id: number; discount_block: string; price: number; discount_pct: number };
type Wishlist = {
	name: string;
	release_date: string | number;
	priority: number;
	is_free_game: boolean;
	subs: Package[];
};

type App = { appid: number; name: string; playtime_2weeks: number; playtime_forever: number };
type RecentlyPlayed = { total_count?: number; games?: App[] };

let API_KEY: string | null = null;

const validateApiKey = () => {
	if (!API_KEY) throw new Error('Steam API key is not set.');
};

export const setApiKey = (apiKey: string) => (API_KEY = apiKey);

export const getSteamId64 = async (customId: string) => {
	validateApiKey();
	const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${customId}`;
	const { payload } = await FetchUtil.fetch<Payload<SteamId64>>({ url });
	return payload.response?.steamid ?? null;
};

export const getProfile = async (steamId: string) => {
	validateApiKey();
	const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamId}`;
	const { payload } = await FetchUtil.fetch<Payload<Payload<Profile[]>>>({ url });

	if (payload.response.players.length === 0) throw new Error(`Cannot find a profile for steamId ${steamId}.`);
	const { personaname, avatarfull, personastate, lastlogoff, timecreated } = payload.response.players[0];

	return {
		name: personaname,
		image: avatarfull,
		status: Status[personastate],
		logoutAt: new Date(lastlogoff * 1000),
		createdAt: new Date(timecreated * 1000),
	};
};

export const getRecentlyPlayed = async (steamId: string) => {
	validateApiKey();
	const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${steamId}&format=json`;
	const { payload } = await FetchUtil.fetch<Payload<RecentlyPlayed>>({ url });

	return (payload.response.games ?? []).map(({ appid, name, playtime_2weeks, playtime_forever }) => ({
		name,
		id: appid,
		totalHours: ConverterUtil.toHours(playtime_forever * 1000 * 60),
		twoWeeksHours: ConverterUtil.toHours(playtime_2weeks * 1000 * 60),
		url: `https://store.steampowered.com/app/${appid}`,
	}));
};

export const getWishlist = async (steamId: string) => {
	const wishlist = [];

	let page = 0;
	while (true) {
		const url = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata?p=${page}`;
		const { payload } = await FetchUtil.fetch<Payload<Wishlist>>({ url });

		const hasMore = Object.keys(payload).some((id) => !isNaN(Number(id)));
		if (!hasMore) break;

		for (const [id, { name, release_date, priority, is_free_game, subs }] of Object.entries(payload)) {
			const isPriced = !is_free_game && subs.length > 0;

			const discount = isPriced ? subs[0].discount_pct : null;
			const discounted = isPriced ? ConverterUtil.centsToEuros(subs[0].price) : null;
			const regular = isPriced
				? ConverterUtil.centsToEuros(Math.round((100 * subs[0].price) / (100 - subs[0].discount_pct)))
				: null;

			wishlist.push({
				id,
				name,
				priority,
				discount,
				discounted,
				regular,
				url: `https://store.steampowered.com/app/${id}`,
				free: is_free_game,
				released: typeof release_date === 'string',
				sale: Boolean(discount && discounted),
			});
		}
		page++;
	}

	return wishlist.sort(
		(a, b) => (a.priority !== 0 ? a.priority : Infinity) - (b.priority !== 0 ? b.priority : Infinity),
	);
};

export const getNextSales = async () => await getSalesList(Endpoint.NEXT_SALES);

export const getTopPlayed = async () => {
	const topPlayedCharts = await getChartsList(Endpoint.TOP_PLAYED);
	return topPlayedCharts.map(
		({ position, name, url, count }) => `\`${position}.\` **[${name}](${url})** **(${count} players)**`,
	);
};

export const getTopSellers = async () => {
	const topSellersList = await getSteamList(Endpoint.TOP_SELLERS);
	return topSellersList.map(({ position, name, url }) => `\`${position}.\` **[${name}](${url})**`);
};

export const getUpcoming = async () => {
	const upcomingList = await getSteamList(Endpoint.UPCOMING_GAMES);
	return upcomingList.map(({ position, name, url }) => `\`${position}.\` **[${name}](${url})**`);
};
