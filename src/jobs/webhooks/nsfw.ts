import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as FilesUtil from '../../utils/files';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Nsfw,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of process.env.NSFW_SUBREDDITS?.split(',') ?? []) {
		const {
			0: {
				data: { title, permalink, url, gallery_data, preview, secure_media },
			},
		} = await Reddit.getPosts(subreddit);

		const isRedGif = secure_media?.type === 'redgifs.com';
		const redditFallbackUrl = preview?.reddit_video_preview?.fallback_url;
		if (isRedGif && !redditFallbackUrl) continue;

		const galleryMediaId = gallery_data?.items[0].media_id;
		const nsfwUrl = getUrl(url, galleryMediaId, redditFallbackUrl);

		const isReachable = await FilesUtil.isReachable(nsfwUrl);
		if (!isReachable) continue;

		const hasEntry = await client.manageState('NSFW', subreddit, title, nsfwUrl);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Nsfw);
			if (!webhook) continue;

			const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => nsfwUrl.includes(extension));
			if (hasVideoExtension || isRedGif) {
				const formattedTitle = `[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)`;

				await webhook.send({ content: `**${formattedTitle}**\n${nsfwUrl}` });
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(`https://www.reddit.com${permalink}`)
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
