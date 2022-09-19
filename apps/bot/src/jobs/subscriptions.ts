import type { CatalogCategory } from '@luferro/games-api';
import { SubscriptionsApi } from '@luferro/games-api';
import { SleepUtil, logger } from '@luferro/shared-utils';
import { subscriptionsModel } from '../database/models/subscriptions';
import { JobName } from '../types/enums';

export const data = {
	name: JobName.Subscriptions,
	schedule: new Date(Date.now() + 1000 * 60),
};

export const execute = async () => {
	const categories: CatalogCategory[] = ['PC Game Pass', 'Xbox Game Pass', 'EA Play', 'EA Play Pro', 'Ubisoft Plus'];
	for (const category of categories) {
		try {
			const { catalog } = await SubscriptionsApi.getCatalog(category);
			logger.info(`Subscriptions job found **${catalog.length}** items in **${category}** catalog.`);

			const subscription = await subscriptionsModel.findOne({ name: category });
			if (catalog.length < Math.round((subscription?.catalog.length ?? 0) * 0.6)) continue;

			await subscriptionsModel.updateOne(
				{ name: category },
				{ $set: { catalog: catalog, count: catalog.length } },
				{ upsert: true },
			);

			logger.info(`Subscriptions job successfully updated **${category}** catalog.`);
			SleepUtil.sleep(5000);
		} catch (error) {
			logger.warn(`Subscriptions job failed. Reason: ${(error as Error).message}`);
		}
	}
};
