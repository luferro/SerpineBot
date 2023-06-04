import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';
import { getCategoryFromPath } from '../../../utils/filename';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const articles = await client.api.gaming.xbox.getLatestDealsWithGold();

	for (const { title, url } of articles.reverse()) {
		const isSuccessful = await client.state
			.entry({ job: getCategoryFromPath(__filename, 'jobs'), data: { title, url } })
			.update();
		if (!isSuccessful || !client.api.google.youtube.isVideo(url)) continue;

		const content = `**${StringUtil.truncate(title)}**\n${url}`;
		await client.propageMessage(Webhook.Xbox, content);
	}
};
