import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { YoutubeApi } from '@luferro/google-api';
import { StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.GamingNews,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const {
		0: { title, url, hasEmbeddedMedia, embedType, isSelf, isCrosspost },
	} = await RedditApi.getPosts('Games', 'new');

	const isYoutubeEmbed = embedType === 'youtube.com';
	const isTwitterEmbed = embedType === 'twitter.com';
	const newsUrl = getUrl(url, isYoutubeEmbed, isTwitterEmbed);

	if (!isYoutubeEmbed && YoutubeApi.isVideo(url)) return;

	const hasEntry = await client.manageState('Gaming News', 'News', title, newsUrl);
	if (hasEntry || isCrosspost || isSelf) return;

	const subscribers = isYoutubeEmbed && (await YoutubeApi.getSubscribers(newsUrl));
	if (typeof subscribers === 'number' && subscribers < 50_000) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, 'Gaming News');
		if (!webhook) continue;

		if (hasEmbeddedMedia) {
			await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${newsUrl}` });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(newsUrl).setColor('Random');

		await webhook.send({ embeds: [embed] });
	}
};

const getUrl = (url: string, isVideo: boolean, isTweet: boolean) => {
	if (isTweet) return url.split('?')[0];
	if (isVideo) return `https://www.youtube.com/watch?v=${YoutubeApi.getVideoId(url)}`;
	return url;
};
