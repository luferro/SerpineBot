import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { NewsDataApi } from '@luferro/news-data-api';
import { SleepUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.WorldNews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = [...(await NewsDataApi.getNewsByCountry('Portugal')), ...(await NewsDataApi.getWorldNews())]
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 10);
	if (articles.length === 0) return;

	for (const { title, url } of articles) {
		const hasEntry = await client.manageState('World News', 'News', title, url);
		if (!hasEntry) continue;

		const articleIndex = articles.findIndex(
			({ title: currentTitle, url: currentUrl }) => currentTitle === title && currentUrl === url,
		);
		articles.splice(articleIndex);
		break;
	}

	for (const { title, url, publisher, description, image, publishedAt } of articles.reverse()) {
		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'World News');
			if (!webhook) continue;

			const embed = new EmbedBuilder()
				.setAuthor({ name: publisher })
				.setTitle(title)
				.setURL(url)
				.setDescription(description)
				.setThumbnail(image)
				.setTimestamp(publishedAt)
				.setColor('Random');

			await webhook.send({ embeds: [embed] });

			await SleepUtil.sleep(5000);
		}
	}
};
