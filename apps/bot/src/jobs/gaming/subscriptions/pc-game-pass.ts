import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '30 16 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getPcGamePassCatalog();
	logger.debug(`Found **${catalog.length}** items in **Game Pass For PC** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalog({ category: 'Game Pass For PC' });
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **Game Pass For PC** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog({ category: 'Game Pass For PC', catalog });
	logger.info('Successfully updated **Game Pass For PC** catalog entries.');
};
