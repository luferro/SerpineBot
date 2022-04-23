import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as FilesUtil from '../../utils/files';

export const data = {
	name: 'memes',
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const subreddits = ['Memes', 'DankMemes', 'ProgrammerHumor'];
	for (const subreddit of subreddits) {
		const {
			0: {
				data: { title, permalink, url, is_self },
			},
		} = await Reddit.getPosts(subreddit);

		const isMediaAvailable = await FilesUtil.isAvailable(url);
		if (!isMediaAvailable) continue;

		const hasEntry = await client.manageState('Memes', StringUtil.capitalize(subreddit), title, url);
		if (hasEntry || is_self) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Memes');
			if (!webhook) continue;

			const hasVideoExtension = ['gif', 'gifv', 'mp4'].some((item) => url.includes(item));
			if (hasVideoExtension) {
				await webhook.send({
					content: `**[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)**\n${url}`,
				});
				continue;
			}

			await webhook.send({
				embeds: [
					new MessageEmbed()
						.setTitle(StringUtil.truncate(title))
						.setURL(`https://www.reddit.com${permalink}`)
						.setImage(url)
						.setColor('RANDOM'),
				],
			});
		}
	}
};
