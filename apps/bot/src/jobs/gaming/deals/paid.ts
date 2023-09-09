import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import { Bot } from '../../../Bot';
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

		const formattedDeals = (
			await Promise.all(
				deals.map(async ({ url, discount, regular, current, store, drm }) => {
					const isSuccessful = await client.state({ title, url });
					if (!isSuccessful) return;

					return t('gaming.deals.paid.embed.description', {
						discount: `**-${discount}%**`,
						regular: `~~${regular}~~`,
						current: `**${current}**`,
						store: `**[${store}](${url})**`,
						activates: drm ? `*Activates on ${drm.join(', ')}*` : `*DRM Free*`,
					});
				}),
			)
		).filter((item): item is NonNullable<typeof item> => !!item);

		if (formattedDeals.length === 0) continue;

		const isSingle = formattedDeals.length === 1;
		const { url, expiry } = deals[0];

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(isSingle ? url : null)
			.setDescription(formattedDeals.join('\n'))
			.setFooter(isSingle && expiry ? { text: t('gaming.deals.paid.embed.footer.text', { expiry }) } : null)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
