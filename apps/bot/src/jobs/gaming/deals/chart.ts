import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 0 3 * * *' };

export const execute: JobExecute = async ({ client }) => {
	client.cache.deals.chart = await client.api.gaming.deals.getPopularityChart();
	logger.info('Popularity chart for deals has been updated.');
	logger.debug({ first: client.cache.deals.chart.at(0), last: client.cache.deals.chart.at(-1) });
};
