import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Youtube from '../../apis/youtube';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.GamingNews,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const {
		0: {
			data: { title, url, secure_media, is_self, crosspost_parent },
		},
	} = await Reddit.getPosts('Games', 'new');

	const isVideo = secure_media?.type === 'youtube.com';
	const isTweet = secure_media?.type === 'twitter.com';
	const newsUrl = getUrl(url, isVideo, isTweet);

	if (!isVideo && Youtube.isVideo(url)) return;

	const hasEntry = await client.manageState('Gaming News', 'News', title, newsUrl);
	if (hasEntry || crosspost_parent || is_self) return;

	const subscribers = isVideo && (await Youtube.getSubscribers(newsUrl));
	if (typeof subscribers === 'number' && subscribers < 50_000) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.GamingNews);
		if (!webhook) continue;

		if (secure_media) {
			await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${newsUrl}` });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(newsUrl).setColor('Random');

		await webhook.send({ embeds: [embed] });
	}
};

const getUrl = (url: string, isVideo: boolean, isTweet: boolean) => {
	if (isTweet) return url.split('?')[0];
	if (isVideo) return `https://www.youtube.com/watch?v=${Youtube.getVideoId(url)}`;
	return url;
};
