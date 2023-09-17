import { RssModel } from '@luferro/database';

import { Gamertag } from '../../../types/args';
import { getXboxWireFeed } from './xbox.feed';
import { Chart, getChartData, getGamertagData } from './xbox.scraper';

export const isGamertagValid = async ({ gamertag }: Gamertag) =>
	(await getGamertagData({ gamertag })).name !== "Gamertag doesn't exist";

export const getProfile = async ({ gamertag }: Gamertag) => await getGamertagData({ gamertag });

export const getBlog = async () => {
	const data = [];
	for (const url of await RssModel.getFeeds({ key: 'gaming.xbox' })) {
		data.push(...(await getXboxWireFeed({ url })));
	}
	return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};

export const getChart = async ({ chart }: { chart: Chart }) => await getChartData({ chart });
