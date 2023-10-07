import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const articles = await client.api.gaming.nintendo.getNews();

	const embeds = [];
	for (const { title, url, isTwitterEmbed, isYoutubeEmbed } of articles.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			const content = `**${title}**\n${isTwitterEmbed ? url.split('?')[0] : url}`;
			await client.propageMessage({ category: 'Gaming News', content });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Nintendo', embeds });
};
