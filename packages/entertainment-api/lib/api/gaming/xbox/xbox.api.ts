import { InteractiveScraper, StaticScraper } from '@luferro/scraper/lib';
import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getGamertagDetails, getNewsList, getXboxList } from './xbox.scraper';

export const isGamertagValid = async (gamertag: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAMERTAG, gamertag);
	const html = await InteractiveScraper.getHtml({ url });
	const $ = StaticScraper.loadHtml({ html });
	return $('h1').first().text() !== "Gamertag doesn't exist";
};

export const getProfile = async (gamertag: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAMERTAG, gamertag);
	return await getGamertagDetails(url);
};

export const getLatestPodcastEpisodes = async () => await getNewsList(Endpoint.LATEST_PODCAST);

export const getLatestGamePassAdditions = async () => await getNewsList(Endpoint.LATEST_GAME_PASS);

export const getLatestGamesWithGoldAdditions = async () => await getNewsList(Endpoint.LATEST_GAMES_WITH_GOLD);

export const getLatestDealsWithGold = async () => await getNewsList(Endpoint.LATEST_DEALS_WITH_GOLD);

export const getTopPlayed = async () =>
	(await getXboxList(Endpoint.TOP_PLAYED)).map(({ position, name, url }) => `\`${position}.\` **[${name}](${url})**`);

export const getTopSellers = async () =>
	(await getXboxList(Endpoint.TOP_SELLERS)).map(
		({ position, name, url }) => `\`${position}.\` **[${name}](${url})**`,
	);

export const getUpcoming = async () =>
	(await getXboxList(Endpoint.UPCOMING_GAMES)).map(
		({ position, name, url }) => `\`${position}.\` **[${name}](${url})**`,
	);
