import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { Country, GNewsApi } from '@luferro/gnews-api';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.PortugalNews,
	schedule: new Date(Date.now() + 1000),
};

export const execute = async (client: Bot) => {
	const news = await GNewsApi.getNewsByCountry(Country.Portugal);

	for (const { title, url, publisher, description, image, publishedAt } of news.slice(0, 20).reverse()) {
		const { isDuplicated } = await client.manageState('Breaking News', 'Portugal News', title, url);
		if (isDuplicated) continue;

		const embed = new EmbedBuilder()
			.setAuthor({ name: publisher.name, url: publisher.url })
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setThumbnail(image)
			.setTimestamp(publishedAt)
			.setColor('Random');

		await client.sendWebhookMessageToGuilds('Portugal News', embed);
	}
};
