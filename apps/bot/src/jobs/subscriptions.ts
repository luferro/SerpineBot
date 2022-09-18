import { SubscriptionsApi } from '@luferro/games-api';
import { subscriptionsModel } from '../database/models/subscriptions';
import { logger } from '../utils/logger';
import { JobName } from '../types/enums';

export const data = {
	name: JobName.Subscriptions,
	schedule: '0 0 15 * * *',
};

export const execute = async () => {
	const results = await Promise.allSettled([
		SubscriptionsApi.getCatalog('PC Game Pass'),
		SubscriptionsApi.getCatalog('Xbox Game Pass'),
		SubscriptionsApi.getCatalog('EA Play'),
		SubscriptionsApi.getCatalog('EA Play Pro'),
		SubscriptionsApi.getCatalog('Ubisoft Plus'),
	]);

	const errors = [];
	for (const result of results) {
		if (result.status === 'rejected') {
			errors.push(result.reason);
			continue;
		}

		const { category, catalog } = result.value;
		logger.info(`Subscriptions job found _*${catalog.length}*_ items for _*${category}*_.`);

		const subscription = await subscriptionsModel.findOne({ name: category });
		if (catalog.length < Math.round((subscription?.catalog.length ?? 0) * 0.6)) continue;

		await subscriptionsModel.updateOne(
			{ name: category },
			{ $set: { catalog: catalog, count: catalog.length } },
			{ upsert: true },
		);

		logger.info(`Subscriptions job updated successfully catalog for _*${category}*_.`);
	}

	if (errors.length > 0)
		throw new Error(`Subscriptions job failed fetching one or more catalogs. Reason(s):\n${errors.join('\n')}`);
};
