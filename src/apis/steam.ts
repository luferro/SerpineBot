import { load } from 'cheerio';
import { fetch } from '../services/fetch';
import * as Subscriptions from '../services/subscriptions';
import * as ConverterUtil from '../utils/converter';
import { steamModel } from '../database/models/steam';
import { RecentlyPlayed, SteamId64, SteamProfiles, Wishlist } from '../types/responses';
import { SteamStatus } from '../types/categories';

export const getSteamId64 = async (customId: string) => {
    const data = await fetch<SteamId64>(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${customId}`);
    return data.response?.steamid;
}

export const getProfile = async (steamId: string) => {
    const data = await fetch<SteamProfiles>(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`);
    const { 0: { personaname, avatarfull, personastate, lastlogoff, timecreated } } = data.response.players;

    return {
        name: personaname,
        image: avatarfull,
        status: SteamStatus[personastate],
        logoutAt: new Date(lastlogoff * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
        createdAt: new Date(timecreated * 1000).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })
    }
}

export const getWishlist = async (steamId: string) => {
    const wishlist = [];

    let page = 0;
    let hasMore = true;
    while(hasMore) {
        const data = await fetch<Wishlist>(`https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata?p=${page}`);

        hasMore = Object.keys(data).some(id => !isNaN(Number(id)));
        if(!hasMore) break;

        for(const [id, game] of Object.entries(data)) {
            const { name, release_date, priority, is_free_game, subs } = game;

            const discount = subs?.length > 0 ? subs[0].discount_pct : null;
            const regular = subs?.length > 0 ? ConverterUtil.centsToEuros(Math.round(subs[0].price / ((100 - subs[0].discount_pct) / 100))) : null;
            const discounted = subs?.length > 0 ? ConverterUtil.centsToEuros(subs[0].price) : null;

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
                    xbox_game_pass: subscriptions.some(item => item.name === 'Xbox Game Pass'),
                    pc_game_pass: subscriptions.some(item => item.name === 'PC Game Pass'),
                    ubisoft_plus: subscriptions.some(item => item.name === 'Ubisoft+'),
                    ea_play_pro: subscriptions.some(item => item.name === 'EA Play Pro'),
                    ea_play: subscriptions.some(item => item.name === 'EA Play')
                }
            });
        }
        page++;
    }
    return wishlist.sort((a, b) => (a.priority !== 0 ? a.priority : Infinity) - (b.priority !== 0 ? b.priority : Infinity));
}

export const getRecentlyPlayed = async (steamId: string) => {
    const data = await fetch<RecentlyPlayed>(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json`);
    if(!data.response.games) return;

    const integration = await steamModel.findOne({ 'profile.id': steamId });

    return data.response.games.map(item => {
        const totalHours = ConverterUtil.minutesToHours(item.playtime_forever);
        const twoWeeksHours = ConverterUtil.minutesToHours(item.playtime_2weeks);

        const storedEntry = integration?.recentlyPlayed?.find(nestedItem => nestedItem.id === item.appid);
        const weeklyHours = storedEntry ? totalHours - storedEntry.totalHours : twoWeeksHours;

        return {
            id: item.appid,
            name: item.name,
            url: `https://store.steampowered.com/app/${item.appid}`,
            totalHours: ConverterUtil.minutesToHours(item.playtime_forever),
            weeklyHours: Number(weeklyHours.toFixed(1))
        }
    });
}

export const getNextSale = async() => {
    const data = await fetch<string>('https://prepareyourwallet.com/');
    const $ = load(data);

    const sale = $('p').first().attr('content');
    const status = $('span.status').first().text();

    const upcoming = $('.row').first().children('div').get().map(element => {
        const name = $(element).find('span').first().text();
        const date = $(element).find('p').first().text().trim();
        const fixedDate = date?.replace(/Confirmed|Not confirmed/, '').trim() ?? '';

        return `> __${name}__ ${fixedDate}`;
    });

    return {
        sale,
        status,
        upcoming
    }
}

export const getTopPlayed = async () => {
    const data = await fetch<string>('https://store.steampowered.com/stats/');
    const $ = load(data);

    const topPlayed = $('.player_count_row').get().map((element, index) => {
        const url = $(element).find('a').first().attr('href');
        const name = $(element).find('a').first().text();

        return `\`${index + 1}.\` **[${name}](${url})**`;
    }).slice(0, 10);

    return { topPlayed };
}

export const getTopSellers = async () => {
    const data = await fetch<string>('https://store.steampowered.com/search/?filter=topsellers&os=win');
    const $ = load(data);

    const sellersInfo = $('.search_result_row').get().map(element => {
        const url = $(element).first().attr('href');
        const name = $(element).find('.responsive_search_name_combined .title').first().text();

        return { name, url };
    });

    const topSellers = sellersInfo
        .filter((item, index, self) => index === self.findIndex(nestedItem => nestedItem.url === item.url))
        .slice(0, 10)
        .map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);

    return { topSellers };
}

export const getUpcoming = async () => {
    const data = await fetch<string>('https://store.steampowered.com/search/?filter=popularcomingsoon&os=win');
    const $ = load(data);

    const upcomingInfo = $('.search_result_row').get().map(element => {
        const url = $(element).first().attr('href');
        const name = $(element).find('.responsive_search_name_combined .title').first().text();

        return { name, url };
    });

    const upcoming = upcomingInfo
        .filter((item, index, self) => index === self.findIndex(nestedItem => nestedItem.url === item.url))
        .slice(0, 10)
        .map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);

    return { upcoming };
}