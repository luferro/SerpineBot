import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';
import { getCategoryFromPath } from '../../utils/filename';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const articles = await client.api.gaming.nintendo.getLatestNews();

	const embeds = [];
	for (const { title, url, image } of articles.reverse()) {
		const isSuccessful = await client.state
			.entry({ job: getCategoryFromPath(__filename, 'jobs'), data: { title, url } })
			.update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages(Webhook.Nintendo, embeds);
};
