import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { FileUtil, StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';
import { config } from '../../config/environment';

export const data = {
	name: WebhookName.Memes,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of config.MEMES_SUBREDDITS) {
		const {
			0: { title, url, selfurl, isSelf },
		} = await RedditApi.getPosts(subreddit);

		const isReachable = await FileUtil.isReachable(url);
		if (!isReachable) continue;

		const hasEntry = await client.manageState('Memes', subreddit, title, url);
		if (hasEntry || isSelf) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Memes');
			if (!webhook) continue;

			const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => url.includes(extension));
			if (hasVideoExtension) {
				const formattedTitle = `[${StringUtil.truncate(title)}](<${selfurl}>)`;
				await webhook.send({ content: `**${formattedTitle}**\n${url}` });
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(url)
				.setColor('Random');

			await webhook.send({ embeds: [embed] });
		}
	}
};
