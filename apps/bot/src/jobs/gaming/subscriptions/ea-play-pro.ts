import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 10 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalog = await client.api.gaming.subscriptions.getEaPlayProCatalog();
	logger.debug(`Found **${catalog.length}** items in **EA Play Pro** catalog.`);

	const storedSubscription = await SubscriptionsModel.getCatalog({ category: 'EA Play Pro' });
	if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
		logger.warn('Ignoring **EA Play Pro** catalog...');
		return;
	}

	await SubscriptionsModel.updateCatalog({ category: 'EA Play Pro', catalog });
	logger.info('Successfully updated **EA Play Pro** catalog entries.');
};
