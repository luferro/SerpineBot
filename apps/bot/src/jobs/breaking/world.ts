import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const news = await client.api.news.getNews();
	const sortedNews = news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

	const embeds = [];
	for (const { title, url, publisher, description, image, publishedAt } of sortedNews.reverse()) {
		const isSuccessful = await client.state({ title, url });
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

	await client.propageMessages({ category: 'World News', embeds });
};
