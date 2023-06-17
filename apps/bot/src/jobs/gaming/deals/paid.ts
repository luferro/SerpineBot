import { EmbedBuilder } from 'discord.js';

import { Bot } from '../../../structures/Bot';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	if (client.cache.deals.chart.length === 0) await Bot.jobs.get('gaming.deals.chart')?.execute({ client });

	const deals = await client.api.gaming.itad.getLatestDeals();
	const paidDeals = deals.filter(({ isFree }) => !isFree);

	const embeds = [];
	for (const { title, url, discount, regular, current, store, expiry } of paidDeals.reverse()) {
		const isPopular = client.cache.deals.chart.some((game) => game.title === title);
		if (!isPopular) continue;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(`**${discount}%** off! ~~${regular}~~ | **${current}** @ **${store}**`)
			.setColor('Random');
		if (expiry) embed.setFooter({ text: `Expires on ${expiry}` });

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
