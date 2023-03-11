import { SubscriptionsModel } from '@luferro/database';
import { SubscriptionsApi } from '@luferro/games-api';
import { logger } from '@luferro/shared-utils';

import type { JobData } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Subscriptions,
	schedule: '30 16 * * *',
};

export const execute = async () => {
	const catalogs = await SubscriptionsApi.getCatalogs(true);
	for (const { category, catalog } of catalogs) {
		logger.debug(`Job **${data.name}** found **${catalog.length}** items in **${category}** catalog.`);

		const subscription = await SubscriptionsModel.getCatalogByCategory(category);
		if (catalog.length < Math.round((subscription?.count ?? 0) * 0.6)) continue;

		await SubscriptionsModel.updateCatalog(category, catalog);

		logger.info(`Job **${data.name}** successfully updated **${category}** catalog.`);
	}
};
