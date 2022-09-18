import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { FileUtil, StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';
import { config } from '../../config/environment';

export const data = {
	name: WebhookName.Nsfw,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of config.NSFW_SUBREDDITS ?? []) {
		const {
			0: { title, url, selfurl, gallery, fallback, embedType },
		} = await RedditApi.getPosts(subreddit);

		const isRedGifsEmbed = embedType === 'redgifs.com';
		const redditFallbackUrl = fallback?.reddit_video_preview?.fallback_url;
		if (isRedGifsEmbed && !redditFallbackUrl) continue;

		const galleryMediaId = gallery?.items[0].media_id;
		const nsfwUrl = getUrl(url, galleryMediaId, redditFallbackUrl);

		const isReachable = await FileUtil.isReachable(nsfwUrl);
		if (!isReachable) continue;

		const hasEntry = await client.manageState('NSFW', subreddit, title, nsfwUrl);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Nsfw');
			if (!webhook) continue;

			const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => nsfwUrl.includes(extension));
			if (hasVideoExtension || isRedGifsEmbed) {
				const formattedTitle = `[${StringUtil.truncate(title)}](<${selfurl}>)`;
				await webhook.send({ content: `**${formattedTitle}**\n${nsfwUrl}` });
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(nsfwUrl)
				.setColor('Random');

			await webhook.send({ embeds: [embed] });
		}
	}
};

const getUrl = (url: string, galleryMediaId?: string, fallbackUrl?: string) => {
	if (galleryMediaId) return `https://i.redd.it/${galleryMediaId}.jpg`;
	return fallbackUrl ?? url;
};
