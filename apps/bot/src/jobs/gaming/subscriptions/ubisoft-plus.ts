import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 40 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getUbisoftPlusCatalog();
	logger.debug(`Found **${catalog.length}** items in **Ubisoft Plus** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalog({ category: 'Ubisoft Plus' });
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **Ubisoft Plus** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog({ category: 'Ubisoft Plus', catalog });
	logger.info('Successfully updated **Ubisoft Plus** catalog entries.');
};
