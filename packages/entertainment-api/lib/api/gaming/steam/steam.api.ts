import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';

import { Id } from '../../../types/args';
import { Chart, getChartData, getNextSalesData } from './steam.scraper';

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

type Profile = {
	personaname: string;
	avatarfull: string;
	lastlogoff: number;
	personastate: number;
	timecreated: number;
};

type Wishlist = {
	name: string;
	release_date: string | number;
	priority: number;
	is_free_game: boolean;
	subs: { id: number; discount_block: string; price: number; discount_pct: number }[];
};

type RecentlyPlayed = {
	total_count?: number;
	games?: { appid: number; name: string; playtime_2weeks: number; playtime_forever: number }[];
};

const getApiKey = () => {
	if (!process.env.STEAM_API_KEY) throw new Error('STEAM_API_KEY is not set.');
	return process.env.STEAM_API_KEY;
};

export const getSteamId64 = async ({ id }: Id) => {
	const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${getApiKey()}&vanityurl=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<{ steamid?: string }>>({ url });
	return payload.response?.steamid ?? null;
};

export const getProfile = async ({ id }: Id) => {
	const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${getApiKey()}&steamids=${id}`;
	const { payload } = await FetchUtil.fetch<Payload<Payload<Profile[]>>>({ url });

	if (payload.response.players.length === 0) throw new Error(`Cannot find a profile for steamId64 ${id}.`);
	const { personaname, avatarfull, personastate, lastlogoff, timecreated } = payload.response.players[0];

	return {
		name: personaname,
		image: avatarfull,
		status: Status[personastate],
		logoutAt: new Date(lastlogoff * 1000),
		createdAt: new Date(timecreated * 1000),
	};
};

export const getRecentlyPlayed = async ({ id }: Id) => {
	const { payload } = await FetchUtil.fetch<Payload<RecentlyPlayed>>({
		url: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${getApiKey()}&steamid=${id}&format=json`,
	});

	return (payload.response.games ?? []).map(({ appid, name, playtime_2weeks, playtime_forever }) => ({
		name,
		id: appid,
		totalHours: ConverterUtil.toHours(playtime_forever * 1000 * 60),
		twoWeeksHours: ConverterUtil.toHours(playtime_2weeks * 1000 * 60),
		url: `https://store.steampowered.com/app/${appid}`,
	}));
};

export const getWishlist = async ({ id }: Id) => {
	const wishlist = [];

	let page = 0;
	while (true) {
		const { payload } = await FetchUtil.fetch<Payload<Wishlist>>({
			url: `https://store.steampowered.com/wishlist/profiles/${id}/wishlistdata?p=${page}`,
		});

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

export const getNextSales = async () => await getNextSalesData();

export const getChart = async ({ chart }: { chart: Chart }) => await getChartData({ chart });
