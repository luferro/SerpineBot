import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	for (const subreddit of client.config.MEMES_SUBREDDITS) {
		const posts = await client.api.reddit.getPosts({ subreddit, limit: 25 });

		const embeds = [];
		for (const { title, url, selfurl, hasEmbeddedMedia, isSelf } of posts.reverse()) {
			if (isSelf) continue;

			const isSuccessful = await client.state({ title, url });
			if (!isSuccessful) continue;

			if (hasEmbeddedMedia) {
				await client.propageMessage({
					category: 'Memes',
					content: `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}`,
				});
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(url)
				.setColor('Random');

			embeds.push(embed);
		}

		await client.propageMessages({ category: 'Memes', embeds });
	}
};
