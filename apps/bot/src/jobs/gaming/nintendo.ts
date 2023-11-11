import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const data = await client.api.reddit.getPostsByFlair({
		subreddit: 'NintendoSwitch',
		sort: 'new',
		flairs: ['News', 'Nintendo Official'],
	});

	const embeds = [];
	for (const { title, url, isTwitterEmbed, isYoutubeEmbed } of data.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			await client.propageMessage({ category: 'Nintendo', content: `**${title}**\n${url}` });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Nintendo', embeds });
};
