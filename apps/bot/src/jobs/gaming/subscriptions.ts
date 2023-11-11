import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalogs = await client.api.gaming.games.subscriptions.getCatalogs();
	for (const { catalog, entries } of catalogs) {
		logger.debug(`Found **${entries.length}** items in **${catalog}** catalog.`);

		const storedSubscription = await SubscriptionsModel.getCatalog({ catalog });
		if (entries.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
			logger.warn(`Ignoring **${catalog}** catalog...`);
			continue;
		}

		await SubscriptionsModel.updateCatalog({ catalog, entries });
		logger.info(`Successfully updated **${catalog}** catalog entries.`);
	}
};
