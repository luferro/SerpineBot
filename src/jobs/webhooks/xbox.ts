import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Xbox from '../../apis/xbox';
import * as Youtube from '../../apis/youtube';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { XboxWireCategories } from '../../types/categories';

export const data = {
	name: 'xbox',
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: XboxWireCategories[] = ['gamepass', 'deals with gold', 'games with gold'];
	for (const category of categories) {
		const articles = await Xbox.getLatestXboxWireNews(category);
		if (articles.length === 0) continue;

		const {
			0: { title, url, image },
		} = articles;

		const hasEntry = await client.manageState('Xbox', StringUtil.capitalize(category), title, url);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Xbox');
			if (!webhook) continue;

			if (Youtube.isVideo(url)) {
				await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${url}` });
				continue;
			}

			const message = new MessageEmbed().setTitle(StringUtil.truncate(title)).setURL(url).setColor('RANDOM');
			category === 'gamepass' && title.toLowerCase().includes('coming soon')
				? message.setImage(image)
				: message.setThumbnail(image);

			await webhook.send({ embeds: [message] });
		}
	}
};
