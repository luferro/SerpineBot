import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { YoutubeApi } from '@luferro/google-api';
import { SleepUtil, StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.GamingNews,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const posts = await RedditApi.getPosts('Games', 'new', 25);

	for (const { title, url, hasEmbeddedMedia, embedType, isSelf, isCrosspost } of posts.reverse()) {
		await SleepUtil.sleep(1000);
		if (isCrosspost || isSelf) continue;

		const isTwitterEmbed = embedType === 'twitter.com';
		const isYoutubeEmbed = embedType === 'youtube.com';
		if (!isYoutubeEmbed && YoutubeApi.isVideo(url)) continue;

		const newsUrl = getUrl(url, isYoutubeEmbed, isTwitterEmbed);

		const { isDuplicated } = await client.manageState('Gaming News', 'News', title, newsUrl);
		if (isDuplicated) continue;

		const subscribers = isYoutubeEmbed ? await YoutubeApi.getSubscribers(newsUrl) : null;
		if (typeof subscribers === 'number' && subscribers < 50_000) continue;

		const message = hasEmbeddedMedia
			? `**${StringUtil.truncate(title)}**\n${newsUrl}`
			: new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(newsUrl).setColor('Random');

		await client.sendWebhookMessageToGuilds('Gaming News', message);
	}
};

const getUrl = (url: string, isVideo: boolean, isTweet: boolean) => {
	if (isTweet) return url.split('?')[0];
	if (isVideo) return `https://www.youtube.com/watch?v=${YoutubeApi.getVideoId(url)}`;
	return url;
};
