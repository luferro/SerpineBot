import { SubscriptionsApi } from '@luferro/games-api';
import { logger } from '@luferro/shared-utils';
import { subscriptionsModel } from '../database/models/subscriptions';
import { JobName } from '../types/enums';

export const data = {
	name: JobName.Subscriptions,
	schedule: new Date(Date.now() + 1000 * 60),
};

export const execute = async () => {
	const catalogs = await SubscriptionsApi.getCatalogs(true);
	for (const { category, catalog } of catalogs) {
		logger.info(`Subscriptions job found **${catalog.length}** items in **${category}** catalog.`);

		const subscription = await subscriptionsModel.findOne({ name: category });
		if (catalog.length < Math.round((subscription?.count ?? 0) * 0.6)) continue;

		await subscriptionsModel.updateOne(
			{ name: category },
			{ $set: { catalog: catalog, count: catalog.length } },
			{ upsert: true },
		);

		logger.info(`Subscriptions job successfully updated **${category}** catalog.`);
	}
};