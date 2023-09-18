import { RssModel } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const feeds = await RssModel.getFeeds({ key: 'gaming.news' });
	const data = await client.api.gaming.news.getNews({ feeds });

	const embeds = [];
	for (const { title, url, image, isTwitterEmbed, isYoutubeEmbed } of data.reverse()) {
		if (isYoutubeEmbed && (await client.scraper.youtube.getSubscribers({ url })) < 50_000) continue;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			const content = `**${title}**\n${isTwitterEmbed ? url.split('?')[0] : url}`;
			await client.propageMessage({ category: 'Gaming News', content });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		if (image) embed.setThumbnail(image);

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Gaming News', embeds });
};
