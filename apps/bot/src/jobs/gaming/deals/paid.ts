import { EmbedBuilder } from 'discord.js';

import { Bot } from '../../../structures/Bot';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	if (client.cache.deals.chart.length === 0) await Bot.jobs.get('gaming.deals.chart')?.execute({ client });

	const deals = await client.api.gaming.deals.getLatestDeals();
	const paidDeals = deals.filter(({ isFree }) => !isFree);

	const embeds = [];
	for (const { id, title, url, discount, regular, current, store, drm, expiry } of paidDeals.reverse()) {
		const isPopular = client.cache.deals.chart.some((game) => game.plain === id);
		if (!isPopular) continue;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const deal = `**-${discount}%** off! ~~${regular}~~ | **${current}** @ **${store}**`;
		const activates = drm ? `*Activates on ${drm.join(', ')}*` : `*DRM Free*`;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(`${deal}\n${activates}`)
			.setColor('Random');
		if (expiry) embed.setFooter({ text: `Expires on ${expiry}` });

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
