import { RSSModel } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const feeds = (await RSSModel.getFeeds({ key: 'gaming.xbox' })).map((feed) => ({
		feed,
		options: { image: { selector: '.post-header__image img' } },
	}));
	const articles = await client.scraper.rss.consume({ feeds });

	const embeds = [];
	for (const { title, url, image } of articles.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (client.scraper.youtube.isVideo({ url })) {
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
