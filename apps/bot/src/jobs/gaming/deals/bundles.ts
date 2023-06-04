import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';
import { getCategoryFromPath } from '../../../utils/filename';

export const data: JobData = { schedule: '0 */8 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const { title, url, lead, image } = await client.api.gaming.deals.getLatestSale();
	if (!title || !url) return;

	const isSuccessful = await client.state
		.entry({ job: getCategoryFromPath(__filename, 'jobs'), data: { title, url } })
		.update();
	if (!isSuccessful) return;

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(url)
		.setThumbnail(image)
		.setDescription(lead ?? 'N/A')
		.setColor('Random');

	await client.propageMessages(Webhook.Deals, [embed]);
};
