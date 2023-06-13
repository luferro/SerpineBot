import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const posts = await client.api.reddit.getPosts('Games', 'new', 25);

	const embeds = [];
	for (const { title, url, hasEmbeddedMedia, embedType, isSelf, isCrosspost } of posts.reverse()) {
		if (isCrosspost || isSelf) continue;

		if (embedType === 'youtube.com') {
			const { channel } = await client.api.google.youtube.getVideoDetails(url);
			if (typeof channel.subscribers === 'number' && channel.subscribers < 50_000) continue;
		}

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (hasEmbeddedMedia) {
			const content = `**${StringUtil.truncate(title)}**\n${url}`;
			await client.propageMessage({ category: 'Gaming News', content });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Gaming News', embeds });
};
