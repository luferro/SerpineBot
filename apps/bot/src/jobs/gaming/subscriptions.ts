import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 0 2 * * *" };

export const execute: JobExecute = async ({ client }) => {
	const catalogs = await client.db.subscription.findMany();
	for (const catalog of catalogs) {
		const updatedCatalog = await client.api.gaming.games.subscriptions.getCatalog(catalog.url, catalog.selectors);
		client.logger.debug(`Subscriptions | Found ${updatedCatalog.length} entries in ${catalog.url} catalog`);

		if (updatedCatalog.length < Math.round(catalog.count * 0.6)) {
			client.logger.warn(`Subscriptions | Catalog ${catalog.url} ignored`);
			continue;
		}

		await client.db.subscription.update({
			where: { id: catalog.id },
			data: { entries: updatedCatalog, count: updatedCatalog.length },
		});
		client.logger.info(`Subscriptions | Catalog ${catalog.url} updated`);
	}
};
