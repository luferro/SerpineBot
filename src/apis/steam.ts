import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import * as Subscriptions from '../services/subscriptions';
import * as ConverterUtil from '../utils/converter';
import { steamModel } from '../database/models/steam';
import { RecentlyPlayed, SteamId64, SteamProfiles, Wishlist } from '../types/responses';

enum SteamStatus {
	'Offline',
	'Online',
	'Busy',
	'Away',
	'Snooze',
	'Looking to trade',
	'Looking to play',
}

export const getSteamId64 = async (customId: string) => {
	const data = await fetch<SteamId64>({
		url: `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${customId}`,
	});

	return data.response?.steamid;
};

export const getProfile = async (steamId: string) => {
	const {
		response: {
			players: {
				0: { personaname, avatarfull, personastate, lastlogoff, timecreated },
			},
		},
	} = await fetch<SteamProfiles>({
		url: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`,
	});

	return {
		name: personaname,
		image: avatarfull,
		status: SteamStatus[personastate],
		logoutAt: new Date(lastlogoff * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
		createdAt: new Date(timecreated * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
	};
};

export const getWishlist = async (steamId: string) => {
	const wishlist = [];

	let page = 0;
	while (true) {
		const data = await fetch<Wishlist>({
			url: `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata?p=${page}`,
		});

		const hasMore = Object.keys(data).some((id) => !isNaN(Number(id)));
		if (!hasMore) break;

		for (const [id, { name, release_date, priority, is_free_game, subs }] of Object.entries(data)) {
			const discount = subs?.length > 0 ? subs[0].discount_pct : null;
			const discounted = subs?.length > 0 ? ConverterUtil.centsToEuros(subs[0].price) : null;
			const regular =
				subs?.length > 0
					? ConverterUtil.centsToEuros(Math.round(subs[0].price / ((100 - subs[0].discount_pct) / 100)))
					: null;

			const subscriptions = await Subscriptions.getGamingSubscriptions(name);

			wishlist.push({
				id,
				name,
				url: `https://store.steampowered.com/app/${id}`,
				priority,
				discount,
				regular,
				discounted,
				free: is_free_game,
				released: typeof release_date === 'string',
				sale: Boolean(discount && discounted),
				subscriptions: {
					xbox_game_pass: subscriptions.some(({ name }) => name === 'Xbox Game Pass'),
					pc_game_pass: subscriptions.some(({ name }) => name === 'PC Game Pass'),
					ubisoft_plus: subscriptions.some(({ name }) => name === 'Ubisoft+'),
					ea_play_pro: subscriptions.some(({ name }) => name === 'EA Play Pro'),
					ea_play: subscriptions.some(({ name }) => name === 'EA Play'),
				},
			});
		}
		page++;
	}

	return wishlist.sort(
		(a, b) => (a.priority !== 0 ? a.priority : Infinity) - (b.priority !== 0 ? b.priority : Infinity),
	);
};

export const getRecentlyPlayed = async (steamId: string) => {
	const {
		response: { games },
	} = await fetch<RecentlyPlayed>({
		url: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json`,
	});
	if (!games) return;

	const integration = await steamModel.findOne({ 'profile.id': steamId });

	return games.map(({ appid, name, playtime_2weeks, playtime_forever }) => {
		const twoWeeksHours = ConverterUtil.minutesToHours(playtime_2weeks);
		const totalHours = ConverterUtil.minutesToHours(playtime_forever);

		const storedEntry = integration?.recentlyPlayed?.find(({ id }) => id === appid);
		const weeklyHours = storedEntry ? totalHours - storedEntry.totalHours : twoWeeksHours;

		return {
			id: appid,
			name,
			url: `https://store.steampowered.com/app/${appid}`,
			totalHours: ConverterUtil.minutesToHours(playtime_forever),
			weeklyHours: Number(weeklyHours.toFixed(1)),
		};
	});
};

export const getNextSale = async () => {
	const data = await fetch<string>({ url: 'https://prepareyourwallet.com/' });
	const $ = load(data);

	const sale = $('p').first().attr('content');
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

	return {
		sale,
		status,
		upcoming,
	};
};

export const getTopPlayed = async () => {
	const data = await fetch<string>({ url: 'https://store.steampowered.com/stats/' });
	const $ = load(data);

	return $('.player_count_row')
		.get()
		.map((element, index) => {
			const url = $(element).find('a').first().attr('href');
			const name = $(element).find('a').first().text();

			return `\`${index + 1}.\` **[${name}](${url})**`;
		})
		.slice(0, 10);
};

export const getTopSellers = async () => {
	const data = await fetch<string>({ url: 'https://store.steampowered.com/search/?filter=topsellers&os=win' });
	const $ = load(data);

	const sellersInfo = $('.search_result_row')
		.get()
		.map((element) => {
			const url = $(element).first().attr('href');
			const name = $(element).find('.responsive_search_name_combined .title').first().text();

			return {
				name,
				url,
			};
		});

	return sellersInfo
		.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
		.slice(0, 10)
		.map(({ name, url }, index) => `\`${index + 1}.\` **[${name}](${url})**`);
};

export const getUpcoming = async () => {
	const data = await fetch<string>({ url: 'https://store.steampowered.com/search/?filter=popularcomingsoon&os=win' });
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
