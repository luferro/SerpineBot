import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '30 16 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getXboxGamePassCatalog();
	logger.debug(`Found **${catalog.length}** items in **Xbox Game Pass** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalog({ category: 'Xbox Game Pass' });
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **Xbox Game Pass** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog({ category: 'Xbox Game Pass', catalog });
	logger.info('Successfully updated **Xbox Game Pass** catalog entries.');
};
