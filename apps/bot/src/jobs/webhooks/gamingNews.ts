import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.GamingNews,
	schedule: '0 */6 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const posts = await client.api.reddit.getPosts('Games', 'new', 25);

	const embeds = [];
	for (const { title, url, hasEmbeddedMedia, embedType, isSelf, isCrosspost } of posts.reverse()) {
		if (isCrosspost || isSelf) continue;

		const isTwitterEmbed = embedType === 'twitter.com';
		const isYoutubeEmbed = embedType === 'youtube.com';
		if (!isYoutubeEmbed && client.api.google.youtube.isVideo(url)) continue;

		const newsUrl = await getUrl(client, url, isYoutubeEmbed, isTwitterEmbed);

		const isSuccessful = await client.state.entry({ job: data.name, data: { title, url: newsUrl } }).update();
		if (!isSuccessful) continue;

		let subscribers = null;
		if (isYoutubeEmbed) {
			const { channel } = await client.api.google.youtube.getVideoDetails(url);
			subscribers = channel.subscribers;
			if (typeof subscribers === 'number' && subscribers < 50_000) continue;
		}

		if (hasEmbeddedMedia) {
			const content = `**${StringUtil.truncate(title)}**\n${url}`;
			await client.propageMessage(Webhook.GamingNews, content);
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embeds.push(embed);
	}

	await client.propageMessages(Webhook.GamingNews, embeds);
};

const getUrl = async (client: Bot, url: string, isVideo: boolean, isTweet: boolean) => {
	if (isTweet) return url.split('?')[0];
	if (isVideo) return `https://www.youtube.com/watch?v=${client.api.google.youtube.getVideoId(url)}`;
	return url;
};
