import { ConverterUtil, FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

import { StatusEnum } from '../types/enums';
import type { SteamId64, SteamPlayers, SteamRecentlyPlayed, SteamResponse, SteamWishlist } from '../types/response';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

export const getSteamId64 = async (customId: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const data = await FetchUtil.fetch<SteamResponse<SteamId64>>({
		url: `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${customId}`,
	});

	return data.response?.steamid ?? null;
};

export const getProfile = async (steamId: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const {
		response: {
			players: {
				0: { personaname, avatarfull, personastate, lastlogoff, timecreated },
			},
		},
	} = await FetchUtil.fetch<SteamResponse<SteamPlayers>>({
		url: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamId}`,
	});

	return {
		name: personaname,
		image: avatarfull,
		status: StatusEnum[personastate],
		logoutAt: new Date(lastlogoff * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
		createdAt: new Date(timecreated * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
	};
};

export const getWishlist = async (steamId: string) => {
	const wishlist = [];

	let page = 0;
	while (true) {
		const data = await FetchUtil.fetch<SteamResponse<SteamWishlist>>({
			url: `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata?p=${page}`,
		});

		const hasMore = Object.keys(data).some((id) => !isNaN(Number(id)));
		if (!hasMore) break;

		for (const [id, { name, release_date, priority, is_free_game, subs }] of Object.entries(data)) {
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

export const getRecentlyPlayed = async (steamId: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const { response } = await FetchUtil.fetch<SteamResponse<SteamRecentlyPlayed>>({
		url: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${steamId}&format=json`,
	});

	const games = response.games ?? [];
	return games.map(({ appid, name, playtime_2weeks, playtime_forever }) => {
		const totalHours = ConverterUtil.toHours(playtime_forever * 1000 * 60) as number;
		const twoWeeksHours = Number((ConverterUtil.toHours(playtime_2weeks * 1000 * 60) as number).toFixed(1));

		return {
			name,
			totalHours,
			twoWeeksHours,
			id: appid,
			url: `https://store.steampowered.com/app/${appid}`,
		};
	});
};

export const getNextSale = async () => {
	const data = await FetchUtil.fetch<string>({ url: 'https://prepareyourwallet.com/' });
	const $ = load(data);

	const sale = $('p').first().attr('content') ?? null;
	const status = $('span.status').first().text();
	const upcoming = $('.row')
		.first()
		.children('div')
		.get()
		.map((element) => {
			const name = $(element).find('span').first().text();
			const date = $(element).find('p').first().text().trim();
			const fixedDate = date?.replace(/Confirmed|Not confirmed/, '').trim() ?? '';

			return `> __${name}__ ${fixedDate}`;
		});

	return { sale, status, upcoming };
};

export const getTopPlayed = async () => {
	const data = await FetchUtil.fetch<string>({ url: 'https://steamcharts.com/' });
	const $ = load(data);

	return $('table#top-games tbody tr')
		.get()
		.map((element, index) => {
			const name = $(element).find('.game-name a').text().trim();
			const href = $(element).find('.game-name a').attr('href');
			const count = $(element).find('.num').first().text();

			const url = `https://store.steampowered.com${href}`;

			return `\`${index + 1}.\` **[${name}](${url})** **(${count} current players)**`;
		});
};

export const getTopSellers = async () => {
	const data = await FetchUtil.fetch<string>({
		url: 'https://store.steampowered.com/search/?filter=topsellers&os=win',
	});
	const $ = load(data);

	const sellersInfo = $('.search_result_row')
		.get()
		.map((element) => {
			const url = $(element).first().attr('href');
			const name = $(element).find('.responsive_search_name_combined .title').first().text();

			return { name, url };
		});

	return sellersInfo
		.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
		.slice(0, 10)
		.map(({ name, url }, index) => `\`${index + 1}.\` **[${name}](${url})**`);
};

export const getUpcoming = async () => {
	const data = await FetchUtil.fetch<string>({
		url: 'https://store.steampowered.com/search/?filter=popularcomingsoon&os=win',
	});
	const $ = load(data);

	const upcomingInfo = $('.search_result_row')
		.get()
		.map((element) => {
			const url = $(element).first().attr('href');
			const name = $(element).find('.responsive_search_name_combined .title').first().text();

			return { name, url };
		});

	return upcomingInfo
		.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
		.slice(0, 10)
		.map(({ name, url }, index) => `\`${index + 1}.\` **[${name}](${url})**`);
};
