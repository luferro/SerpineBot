import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 20 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getPcGamePassCatalog();
	logger.debug(`Found **${catalog.length}** items in **Game Pass For PC** catalog.`);

	let matches = 0;
	const storedSubscription = await SubscriptionsModel.getCatalog({ category: 'Game Pass For PC' });
	if (storedSubscription) {
		for (const { url } of storedSubscription.catalog) {
			const isMatch = catalog.find((item) => item.url === url);
			if (isMatch) matches++;
		}

		if (Math.round(catalog.length * 0.8) > matches) {
			logger.warn('Ignoring **Game Pass For PC** catalog...');
			return;
		}
	}

	await SubscriptionsModel.updateCatalog({ category: 'Game Pass For PC', catalog });
	logger.info('Successfully updated **Game Pass For PC** catalog entries.');
};
