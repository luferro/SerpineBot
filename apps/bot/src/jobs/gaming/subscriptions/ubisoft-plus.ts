import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '30 16 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getUbisoftPlusCatalog();
	logger.debug(`Found ${catalog.length} items in **Ubisoft Plus** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalogByCategory('UbisoftPlus');
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **UbisoftPlus** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog('UbisoftPlus', catalog);
	logger.info('Successfully updated **UbisoftPlus** catalog entries.');
};
