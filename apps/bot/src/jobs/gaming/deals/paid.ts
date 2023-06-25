import { EmbedBuilder } from 'discord.js';

import { Bot } from '../../../structures/Bot';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	if (client.cache.deals.chart.length === 0) await Bot.jobs.get('gaming.deals.chart')?.execute({ client });

	const deals = await client.api.gaming.deals.getLatestDeals();
	const paidDeals = deals.filter(({ isFree }) => !isFree);

	const embeds = [];
	for (const { id, title, deals } of paidDeals.reverse()) {
		const isPopular = client.cache.deals.chart.some((game) => game.plain === id);
		if (!isPopular) continue;

		const isSingle = deals.length === 1;
		const url = isSingle ? deals[0].url : null;
		const footer = isSingle ? { text: `Expires on ${deals[0].expiry}` } : null;

		const formattedDeals = (
			await Promise.all(
				deals.map(async ({ url, discount, regular, current, store, drm }) => {
					const isSuccessful = await client.state({ title, url });
					if (!isSuccessful) return;

					const deal = isSingle
						? `**-${discount}%** off! ~~${regular}~~ | **${current}** @ **${store}**`
						: `**-${discount}%** off! ~~${regular}~~ | **${current}** @ **[${store}](${url})**`;
					const activates = drm ? `*Activates on ${drm.join(', ')}*` : `*DRM Free*`;
					return `${deal}\n${activates}`;
				}),
			)
		).filter((item): item is NonNullable<typeof item> => !!item);

		if (formattedDeals.length === 0) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(formattedDeals.join('\n'))
			.setFooter(footer)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
