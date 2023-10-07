import { Feeds, Gamertag } from '../../../types/args';
import { getXboxWireFeed } from './xbox.feed';
import { Chart, getChartData, getGamertagData } from './xbox.scraper';

export const isGamertagValid = async ({ gamertag }: Gamertag) =>
	(await getGamertagData({ gamertag })).name !== "Gamertag doesn't exist";

export const getProfile = async ({ gamertag }: Gamertag) => await getGamertagData({ gamertag });

export const getNews = async ({ feeds }: Feeds) => {
	const data = [];
	for (const url of feeds) {
		data.push(...(await getXboxWireFeed({ url })));
	}
	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};

export const getChart = async ({ chart }: { chart: Chart }) => await getChartData({ chart });
