import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '30 16 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getEaPlayCatalog();
	logger.debug(`Found ${catalog.length} items in **EA Play** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalogByCategory('EaPlay');
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **EaPlay** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog('EaPlay', catalog);
	logger.info('Successfully updated **EaPlay** catalog entries.');
};
