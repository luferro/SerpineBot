import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as FilesUtil from '../../utils/files';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Memes,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	for (const subreddit of process.env.MEMES_SUBREDDITS?.split(',') ?? []) {
		const {
			0: {
				data: { title, permalink, url, is_self },
			},
		} = await Reddit.getPosts(subreddit);

		const isMediaAvailable = await FilesUtil.isAvailable(url);
		if (!isMediaAvailable) continue;

		const hasEntry = await client.manageState('Memes', subreddit, title, url);
		if (hasEntry || is_self) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Memes);
			if (!webhook) continue;

			const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => url.includes(extension));
			if (hasVideoExtension) {
				const formattedTitle = `[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)`;

				await webhook.send({ content: `**${formattedTitle}**\n${url}` });
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(`https://www.reddit.com${permalink}`)
				.setImage(url)
				.setColor('Random');

			await webhook.send({ embeds: [embed] });
		}
	}
};
