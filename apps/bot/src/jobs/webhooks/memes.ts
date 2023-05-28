import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { config } from '../../config/environment';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Memes,
	schedule: '0 */10 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	for (const subreddit of config.MEMES_SUBREDDITS) {
		const posts = await client.api.reddit.getPosts(subreddit, 'hot', 25);

		const embeds = [];
		for (const { title, url, selfurl, hasEmbeddedMedia, isSelf } of posts.reverse()) {
			if (isSelf) continue;

			const isSuccessful = await client.state
				.entry({ job: data.name, category: subreddit, data: { title, url } })
				.update();
			if (!isSuccessful) continue;

			if (hasEmbeddedMedia) {
				const content = `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}`;
				await client.propageMessage(Webhook.Memes, content);
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(url)
				.setColor('Random');

			embeds.push(embed);
		}

		await client.propageMessages(Webhook.Memes, embeds);
	}
};
