import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */8 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const deals = await client.api.gaming.deals.getLatestFreeDeals();

	const embeds = [];
	for (const { title, url, image, store, discount, regular, discounted } of deals.reverse()) {
		const isSuccessful = await client.state({ title, url: url.original });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url.redirect)
			.setThumbnail(image)
			.setDescription(`**${discount}** off! ~~${regular}~~ | **${discounted}** @ **${store}**`)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Free Games', embeds });
};
