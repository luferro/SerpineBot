import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { NewsDataApi } from '@luferro/news-data-api';
import { SleepUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.WorldNews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const worldNews = await NewsDataApi.getNews();
	const localNews = await NewsDataApi.getNews('Portugal');
	const articles = [...worldNews, ...localNews]
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 20);

	for (const { title, url, publisher, description, image, publishedAt } of articles.reverse()) {
		await SleepUtil.sleep(1000);

		const { isDuplicated } = await client.manageState('World News', 'News', title, url);
		if (isDuplicated) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setThumbnail(image)
			.setTimestamp(publishedAt)
			.setColor('Random');

		if (publisher.name && publisher.url) embed.setAuthor({ name: publisher.name, url: publisher.url });

		await client.sendWebhookMessageToGuilds('World News', embed);
	}
};
