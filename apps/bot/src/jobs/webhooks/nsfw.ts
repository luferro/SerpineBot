import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { SleepUtil, StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';
import { config } from '../../config/environment';

export const data: JobData = {
	name: WebhookName.Nsfw,
	schedule: '0 */15 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of config.NSFW_SUBREDDITS) {
		const posts = await RedditApi.getPosts(subreddit, 'hot', 25);

		for (const { title, url, selfurl, gallery, fallback, embedType, hasEmbeddedMedia } of posts.reverse()) {
			await SleepUtil.sleep(1000);

			const isRedGifsEmbed = embedType === 'redgifs.com';
			const fallbackUrl = fallback?.reddit_video_preview?.fallback_url;
			if (isRedGifsEmbed && !fallbackUrl) continue;

			const galleryMediaId = gallery?.items[0].media_id;
			const nsfwUrl = getUrl(url, galleryMediaId, fallbackUrl);

			const { isDuplicated } = await client.manageState('NSFW', subreddit, title, nsfwUrl);
			if (isDuplicated) continue;

			const message =
				hasEmbeddedMedia || isRedGifsEmbed
					? `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${nsfwUrl}`
					: new EmbedBuilder()
							.setTitle(StringUtil.truncate(title))
							.setURL(selfurl)
							.setImage(nsfwUrl)
							.setColor('Random');

			await client.sendWebhookMessageToGuilds('Nsfw', message);
		}
	}
};

const getUrl = (url: string, galleryMediaId?: string, fallbackUrl?: string) => {
	if (galleryMediaId) return `https://i.redd.it/${galleryMediaId}.jpg`;
	return fallbackUrl ?? url;
};
