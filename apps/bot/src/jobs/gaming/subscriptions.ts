import { logger, StringUtil } from '@luferro/shared-utils';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const catalogs = await client.api.gaming.games.subscriptions.getCatalogs();
	for (const { type, catalog } of catalogs) {
		const name = type.toLowerCase().split('_').map(StringUtil.capitalize).join(' ');
		logger.debug(`Found **${catalog.length}** items in **${name}** catalog.`);

		const storedSubscription = await client.prisma.subscription.findUnique({ where: { type } });
		if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
			logger.warn(`Ignoring **${name}** catalog...`);
			continue;
		}

		await client.prisma.subscription.upsert({
			where: { type },
			create: { type, name, catalog, count: catalog.length },
			update: { catalog, count: catalog.length },
		});
		logger.info(`Successfully updated **${name}** catalog entries.`);
	}
};
