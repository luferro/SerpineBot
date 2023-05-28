import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import { Bot } from '../structures/Bot';
import type { JobData, JobExecute } from '../types/bot';
import { JobName } from '../types/enums';

enum Category {
	PcGamePass = 'PcGamePass',
	XboxGamePass = 'XboxGamePass',
	EaPlay = 'EaPlay',
	EaPlayPro = 'EaPlayPro',
	UbisoftPlus = 'UbisoftPlus',
}

export const data: JobData = {
	name: JobName.Subscriptions,
	schedule: '30 16 * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const catalogs = [
		await getCatalogData(client, Category.PcGamePass),
		await getCatalogData(client, Category.XboxGamePass),
		await getCatalogData(client, Category.EaPlay),
		await getCatalogData(client, Category.EaPlayPro),
		await getCatalogData(client, Category.UbisoftPlus),
	].filter((item): item is NonNullable<typeof item> => !!item);

	for (const { category, catalog } of catalogs) {
		await SubscriptionsModel.updateCatalog(category, catalog);
		logger.info(`Job **${data.name}** successfully updated **${category}** catalog.`);
	}
};

const getCatalogData = async (client: Bot, category: Category) => {
	const select = {
		[Category.PcGamePass]: client.api.gaming.subscriptions.getPcGamePassCatalog,
		[Category.XboxGamePass]: client.api.gaming.subscriptions.getXboxGamePassCatalog,
		[Category.EaPlay]: client.api.gaming.subscriptions.getEaPlayCatalog,
		[Category.EaPlayPro]: client.api.gaming.subscriptions.getEaPlayProCatalog,
		[Category.UbisoftPlus]: client.api.gaming.subscriptions.getUbisoftPlusCatalog,
	};
	const catalog = await select[category]();

	logger.debug(`Job **${data.name}** found **${catalog.length}** items in **${category}** catalog.`);
	const subscription = await SubscriptionsModel.getCatalogByCategory(category);
	if (catalog.length < Math.round((subscription?.count ?? 0) * 0.6)) return;

	return { category, catalog };
};
