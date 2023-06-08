import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */8 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const deals = await client.api.gaming.deals.getLatestPaidDeals();

	const embeds = [];
	for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`**${discount}** off! ~~${regular}~~ | **${discounted}** @ **${store}**`)
			.setColor('Random');
		if (coupon) embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
