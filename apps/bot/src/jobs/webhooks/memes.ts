import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { SleepUtil, StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';
import { config } from '../../config/environment';

export const data: JobData = {
	name: WebhookName.Memes,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of config.MEMES_SUBREDDITS) {
		const posts = await RedditApi.getPosts(subreddit, 'hot', 25);

		for (const { title, url, selfurl, hasEmbeddedMedia, isSelf } of posts.reverse()) {
			await SleepUtil.sleep(1000);
			if (isSelf) continue;

			const { isDuplicated } = await client.manageState('Memes', subreddit, title, url);
			if (isDuplicated) continue;

			const message = hasEmbeddedMedia
				? `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}`
				: new EmbedBuilder()
						.setTitle(StringUtil.truncate(title))
						.setURL(selfurl)
						.setImage(url)
						.setColor('Random');

			await client.sendWebhookMessageToGuilds('Memes', message);
		}
	}
};
