import { RSSModel } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const data = [...(await getFreebies({ client })), ...(await getFreebiesFeeds({ client }))];

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

const getFreebies = async ({ client }: Parameters<typeof execute>[0]) => {
	const data = await client.api.gaming.games.deals.getFreebies();
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

const getFreebiesFeeds = async ({ client }: Parameters<typeof execute>[0]) => {
	const feeds = (await RSSModel.getFeeds({ key: 'gaming.deals.free' })).map((feed) => ({
		feed,
		options: { image: { selector: 'img' } },
	}));
	const data = await client.scraper.rss.consume({ feeds });
	return data.map(({ title, url, image, description }) => ({ title, url, image, description, footer: null }));
};
