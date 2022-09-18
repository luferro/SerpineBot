import type { Bot } from '../../structures/bot';
import type { XboxWireCategory } from '@luferro/games-api';
import { EmbedBuilder } from 'discord.js';
import { XboxApi } from '@luferro/games-api';
import { YoutubeApi } from '@luferro/google-api';
import { StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.Xbox,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: XboxWireCategory[] = ['Deals With Gold', 'Game Pass', 'Games With Gold', 'Podcast'];

	for (const category of categories) {
		const articles = await XboxApi.getLatestXboxWireNews(category);
		if (articles.length === 0) continue;

		const {
			0: { title, url, image },
		} = articles;

		const hasEntry = await client.manageState('Xbox', category, title, url);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Xbox');
			if (!webhook) continue;

			if (YoutubeApi.isVideo(url)) {
				await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${url}` });
				continue;
			}

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			if (category === 'Game Pass' && /Game(.*?)Pass/gi.test(title)) embed.setImage(image);
			else embed.setThumbnail(image);

			await webhook.send({ embeds: [embed] });
		}
	}
};
