import { WebhookEnum } from '@luferro/database';
import type { DealsCategory } from '@luferro/games-api';
import { DealsApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Deals,
	schedule: '0 */8 * * * *',
};

export const execute = async (client: Bot) => {
	for (const category of DealsApi.getCategories()) {
		if (category === 'Free Games' || category === 'Paid Games') {
			return await handleDiscountedDeals(client, category);
		}

		await handleBlogPosts(client, category);
	}
};

const handleDiscountedDeals = async (client: Bot, category: Extract<DealsCategory, 'Paid Games' | 'Free Games'>) => {
	const deals = await DealsApi.getLatestDeals(category);

	for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
		const { isDuplicated } = await client.manageState(data.name, category, title, url);
		if (isDuplicated || (!discount && !regular)) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`**${discount}** off! ~~${regular}~~ | **${discounted}** @ **${store}**`)
			.setColor('Random');

		if (category === 'Paid Games' && coupon) embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);

		const webhook = WebhookEnum[category === 'Free Games' ? 'FreeGames' : 'Deals'];
		await client.sendWebhookMessageToGuilds(webhook, embed);
	}
};

const handleBlogPosts = async (client: Bot, category: Extract<DealsCategory, 'Bundles' | 'Prime Gaming' | 'Sales'>) => {
	const { title, url, lead, image } = await DealsApi.getLatestBlogNews(category);
	if (!title || !url) return;

	const { isDuplicated } = await client.manageState(data.name, category, title, url);
	if (isDuplicated) return;

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(url)
		.setThumbnail(image)
		.setDescription(lead ?? 'N/A')
		.setColor('Random');

	const webhook = WebhookEnum[category === 'Prime Gaming' ? 'FreeGames' : 'Deals'];
	await client.sendWebhookMessageToGuilds(webhook, embed);
};
