import { RssModel } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const data = [...(await getFreebiesData({ client })), ...(await getFeedsData({ client }))];

	const embeds = [];
	for (const { title, url, description, footer } of data.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder().setTitle(title).setURL(url).setDescription(description).setColor('Random');
		if (footer) embed.setFooter({ text: footer.text });

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Free Games', embeds });
};

const getFreebiesData = async ({ client }: Parameters<typeof execute>[0]) => {
	const data = await client.api.gaming.deals.getFreebies();
	return data.map(({ title, url, discount, regular, store, expiry }) => ({
		title,
		url,
		expiry,
		description: t('jobs.gaming.deals.free.embed.description', {
			discount: `**-${discount}%**`,
			regular: `~~${regular}~~`,
			store: `**${store}**`,
		}),
		footer: { text: t('jobs.gaming.deals.free.embed.footer.text', { expiry }) },
	}));
};

const getFeedsData = async ({ client }: Parameters<typeof execute>[0]) => {
	const feeds = await RssModel.getFeeds({ key: 'gaming.deals.free' });
	const data = await client.api.gaming.deals.getDealsFeed({ feeds });
	return data.map(({ title, url, image, description }) => ({ title, url, image, description, footer: null }));
};
