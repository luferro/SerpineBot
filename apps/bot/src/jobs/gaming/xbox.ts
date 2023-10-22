import { RssModel } from '@luferro/database';
import { Youtube } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const feeds = await RssModel.getFeeds({ key: 'gaming.xbox' });
	const articles = await client.api.gaming.xbox.getNews({ feeds });

	const embeds = [];
	for (const { title, url, image } of articles.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (Youtube.isVideo({ url })) {
			const content = `**${title}**\n${url}`;
			await client.propageMessage({ category: 'Xbox', content });
			continue;
		}

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setImage(image)
			.setURL(url)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Xbox', embeds });
};
