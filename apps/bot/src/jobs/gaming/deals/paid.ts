import { Webhook } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';
import { getCategoryFromPath } from '../../../utils/filename';

export const data: JobData = { schedule: '0 */8 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const deals = await client.api.gaming.deals.getLatestPaidDeals();

	const embeds = [];
	for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
		const isSuccessful = await client.state
			.entry({ job: getCategoryFromPath(__filename, 'jobs'), data: { title, url } })
			.update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`**${discount}** off! ~~${regular}~~ | **${discounted}** @ **${store}**`)
			.addFields([{ name: 'Store coupon', value: `*${coupon}*` }])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages(Webhook.Deals, embeds);
};
