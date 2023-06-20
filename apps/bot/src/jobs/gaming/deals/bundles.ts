import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */20 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const sales = await client.api.gaming.deals.getLatestBundles();

	const embeds = [];
	for (const { title, description, image, url } of sales.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setImage(image)
			.setURL(url)
			.setDescription(description)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
