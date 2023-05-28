import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

enum Category {
	Sales = 'Sales',
	Bundles = 'Bundles',
	PrimeGaming = 'Prime Gaming',
	PaidGames = 'Paid Games',
	FreeGames = 'Free Games',
}

export const data: JobData = {
	name: JobName.Deals,
	schedule: '0 */8 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const data = [
		await getBlogData(client, Category.Sales),
		await getBlogData(client, Category.Bundles),
		await getBlogData(client, Category.PrimeGaming),
		await getDealsData(client, Category.FreeGames),
		await getDealsData(client, Category.PaidGames),
	].filter((item): item is NonNullable<typeof item> => !!item);

	for (const { webhook, embeds } of data) {
		await client.propageMessages(webhook, embeds);
	}
};

const getWebhookByCategory = (category: Category) =>
	category === Category.FreeGames || category === Category.PrimeGaming ? Webhook.FreeGames : Webhook.Deals;

const getBlogData = async (client: Bot, category: Exclude<Category, Category.FreeGames | Category.PaidGames>) => {
	const select = {
		[Category.Sales]: client.api.gaming.deals.getLatestSale,
		[Category.Bundles]: client.api.gaming.deals.getLatestBundle,
		[Category.PrimeGaming]: client.api.gaming.deals.getLatestPrimeGamingAddition,
	};
	const { title, url, lead, image } = await select[category]();
	if (!title || !url) return;

	const isSuccessful = await client.state.entry({ job: data.name, category, data: { title, url } }).update();
	if (!isSuccessful) return;

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(url)
		.setThumbnail(image)
		.setDescription(lead ?? 'N/A')
		.setColor('Random');

	return { webhook: getWebhookByCategory(category), embeds: [embed] };
};

const getDealsData = async (client: Bot, category: Extract<Category, Category.FreeGames | Category.PaidGames>) => {
	const select = {
		[Category.FreeGames]: client.api.gaming.deals.getLatestFreeDeals,
		[Category.PaidGames]: client.api.gaming.deals.getLatestPaidDeals,
	};
	const deals = await select[category]();

	const embeds = [];
	for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
		const isSuccessful = await client.state.entry({ job: data.name, category, data: { title, url } }).update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`**${discount}** off! ~~${regular}~~ | **${discounted}** @ **${store}**`)
			.setColor('Random');

		if (category === Category.PaidGames && coupon) {
			embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);
		}

		embeds.push(embed);
	}

	return { webhook: getWebhookByCategory(category), embeds };
};
