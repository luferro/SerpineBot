import { Country } from '@luferro/news-api';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const news = await client.api.news.getNewsByCountry({ country: Country.Portugal });

	const embeds = [];
	for (const { title, url, publisher, description, image, publishedAt } of news.reverse()) {
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

	await client.propageMessages({ category: 'Portugal News', embeds });
};
