import { InteractiveScraper, StaticScraper } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getBlogData, getChartData, getGamertagData } from './xbox.scraper';

type Gamertag = { gamertag: string };
type Chart = { chart: Extract<keyof typeof Endpoint, 'TOP_PLAYED' | 'TOP_SELLERS' | 'UPCOMING_GAMES'> };
type Blog = { blog: Extract<keyof typeof Endpoint, 'PODCAST' | 'GAME_PASS' | 'GAMES_WITH_GOLD' | 'DEALS_WITH_GOLD'> };

export const isGamertagValid = async ({ gamertag }: Gamertag) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAMERTAG, gamertag);
	const html = await InteractiveScraper.getHtml({ url });
	const $ = StaticScraper.loadHtml({ html });
	return $('h1').first().text() !== "Gamertag doesn't exist";
};

export const getProfile = async ({ gamertag }: Gamertag) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAMERTAG, gamertag);
	return await getGamertagData(url);
};

export const getBlog = async ({ blog }: Blog) => await getBlogData(blog);

export const getChart = async ({ chart }: Chart) => await getChartData(chart);
