import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const freebies = await client.api.gaming.deals.getreebies();

	const embeds = [];
	for (const { title, url, discount, regular, store, expiry } of freebies.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(
				t('jobs.gaming.deals.free.embed.description', {
					discount: `**-${discount}%**`,
					regular: `~~${regular}~~`,
					store: `**${store}**`,
				}),
			)
			.setColor('Random');
		if (expiry) embed.setFooter({ text: t('jobs.gaming.deals.free.embed.footer.text', { expiry }) });

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Free Games', embeds });
};
