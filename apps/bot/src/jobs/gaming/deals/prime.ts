import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const { title, url, lead, image } = await client.api.gaming.deals.getLatestPrimeGamingAddition();
	if (!title || !url) return;

	const isSuccessful = await client.state({ title, url });
	if (!isSuccessful) return;

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(url)
		.setThumbnail(image)
		.setDescription(lead ?? 'N/A')
		.setColor('Random');

	await client.propageMessages({ category: 'Free Games', embeds: [embed] });
};
