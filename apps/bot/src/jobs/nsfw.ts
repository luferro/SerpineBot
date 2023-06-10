import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	for (const subreddit of client.config.NSFW_SUBREDDITS) {
		const posts = await client.api.reddit.getPosts(subreddit, 'hot', 25);

		const embeds = [];
		for (const { title, url, selfurl, gallery, fallback, embedType, hasEmbeddedMedia } of posts.reverse()) {
			const isRedGifsEmbed = embedType === 'redgifs.com';
			const redGifsUrl = fallback?.reddit_video_preview?.fallback_url;
			if (isRedGifsEmbed && !redGifsUrl) continue;

			const galleryMediaId = gallery?.items[0].media_id;
			const nsfwUrl = galleryMediaId ? `https://i.redd.it/${galleryMediaId}.jpg` : redGifsUrl ?? url;

			const isSuccessful = await client.state({ title, url: nsfwUrl });
			if (!isSuccessful) continue;

			if (hasEmbeddedMedia) {
				const content = `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${nsfwUrl}`;
				await client.propageMessage({ category: 'Nsfw', content });
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(nsfwUrl)
				.setColor('Random');

			embeds.push(embed);
		}

		await client.propageMessages({ category: 'Nsfw', embeds });
	}
};
