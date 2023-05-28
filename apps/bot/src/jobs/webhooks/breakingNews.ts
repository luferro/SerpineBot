import { Webhook } from '@luferro/database';
import { Country } from '@luferro/news-api';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

enum Category {
	WorldNews = 'World News',
	PortugalNews = 'Portugal News',
}

export const data: JobData = {
	name: JobName.BreakingNews,
	schedule: '0 */30 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const data = [await getNewsData(client, Category.WorldNews), await getNewsData(client, Category.PortugalNews)];

	for (const { webhook, embeds } of data) {
		await client.propageMessages(webhook, embeds);
	}
};

const getWebhookByCategory = (category: Category) =>
	category === Category.WorldNews ? Webhook.WorldNews : Webhook.PortugalNews;

const getNewsData = async (client: Bot, category: Category) => {
	const select = {
		[Category.WorldNews]: client.api.news.getNews,
		[Category.PortugalNews]: () => client.api.news.getNewsByCountry(Country.Portugal),
	};
	const news = await select[category]();
	const sortedNews = news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

	const embeds = [];
	for (const { title, url, publisher, description, image, publishedAt } of sortedNews.reverse()) {
		const isSuccessful = await client.state.entry({ job: data.name, category, data: { title, url } }).update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setAuthor({ name: publisher.name, url: publisher.url })
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setThumbnail(image)
			.setTimestamp(publishedAt)
			.setColor('Random');

		embeds.push(embed);
	}

	return { webhook: getWebhookByCategory(category), embeds };
};
