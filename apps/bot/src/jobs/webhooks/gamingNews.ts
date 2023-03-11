import { WebhookCategory } from '@luferro/database';
import { YoutubeApi } from '@luferro/google-api';
import { RedditApi } from '@luferro/reddit-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.GamingNews,
	schedule: '0 */6 * * * *',
};

export const execute = async (client: Bot) => {
	const posts = await RedditApi.getPosts('Games', 'new', 25);

	for (const { title, url, hasEmbeddedMedia, embedType, isSelf, isCrosspost } of posts.reverse()) {
		if (isCrosspost || isSelf) continue;

		const isTwitterEmbed = embedType === 'twitter.com';
		const isYoutubeEmbed = embedType === 'youtube.com';
		if (!isYoutubeEmbed && YoutubeApi.isVideo(url)) continue;

		const targetUrl = await getUrl(url, isYoutubeEmbed, isTwitterEmbed);

		const { isDuplicated } = await client.manageState(data.name, null, title, targetUrl);
		if (isDuplicated) continue;

		const subscribers = isYoutubeEmbed ? await YoutubeApi.getSubscribers(targetUrl) : null;
		if (typeof subscribers === 'number' && subscribers < 50_000) continue;

		const message = hasEmbeddedMedia
			? `**${StringUtil.truncate(title)}**\n${targetUrl}`
			: new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(targetUrl).setColor('Random');

		await client.sendWebhookMessageToGuilds(WebhookCategory.GamingNews, message);
	}
};

const getUrl = async (url: string, isVideo: boolean, isTweet: boolean) => {
	if (isTweet) return url.split('?')[0];
	if (isVideo) {
		const isPlaylist = await YoutubeApi.isPlaylist(url);
		return isPlaylist ? url : `https://www.youtube.com/watch?v=${YoutubeApi.getVideoId(url)}`;
	}
	return url;
};
