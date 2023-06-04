import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '30 16 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getEaPlayProCatalog();
	logger.debug(`Found ${catalog.length} items in **EA Play Pro** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalogByCategory('EaPlayPro');
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **EaPlayPro** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog('EaPlayPro', catalog);
	logger.info('Successfully updated **EaPlayPro** catalog entries.');
};
