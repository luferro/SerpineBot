import { SubscriptionsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 2 * * *' };

export const execute: JobExecute = async ({ client }) => {
	for (const catalog of ['XBOX_GAME_PASS', 'PC_GAME_PASS', 'EA_PLAY', 'EA_PLAY_PRO', 'UBISOFT_PLUS'] as const) {
		const entries = await client.api.gaming.subscriptions.getCatalog({ catalog });
		logger.debug(`Found **${entries.length}** items in **${catalog}** catalog.`);

		const storedSubscription = await SubscriptionsModel.getCatalog({ catalog });
		if (entries.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
			logger.warn(`Ignoring **${catalog}** catalog...`);
			return;
		}

		await SubscriptionsModel.updateCatalog({ catalog, entries });
		logger.info(`Successfully updated **${catalog}** catalog entries.`);
	}
};
