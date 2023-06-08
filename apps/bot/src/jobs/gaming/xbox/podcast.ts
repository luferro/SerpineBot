import { StringUtil } from '@luferro/shared-utils';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const articles = await client.api.gaming.xbox.getLatestPodcastEpisodes();

	for (const { title, url } of articles.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful || !client.api.google.youtube.isVideo(url)) continue;

		const content = `**${StringUtil.truncate(title)}**\n${url}`;
		await client.propageMessage({ category: 'Xbox', content });
	}
};
