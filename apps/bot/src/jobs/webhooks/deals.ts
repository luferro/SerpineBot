import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import type { DealsCategory } from '@luferro/games-api';
import { EmbedBuilder } from 'discord.js';
import { DealsApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.Deals,
	schedule: '0 */8 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: DealsCategory[] = ['Bundles', 'Free Games', 'Paid Games', 'Prime Gaming', 'Sales'];

	for (const category of categories) {
		if (category === 'Free Games' || category === 'Paid Games') await handleDiscountedDeals(client, category);
		else await handleBlogPosts(client, category);
	}
};

const getWebhookCategory = (category: DealsCategory) =>
	category === 'Prime Gaming' || category === 'Free Games' ? 'Free Games' : 'Deals';

const handleDiscountedDeals = async (client: Bot, category: Extract<DealsCategory, 'Paid Games' | 'Free Games'>) => {
	const deals = await DealsApi.getLatestDeals(category);

	for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
		const { isDuplicated } = await client.manageState('Deals', category, title, url);
		if (isDuplicated) continue;

		const webhookCategory = getWebhookCategory(category);

		const description = `${
			discount && regular ? `**${discount}** off! ~~${regular}~~ |` : ''
		} **${discounted}** @ **${store}**`;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(image)
			.setDescription(description)
			.setColor('Random');

		if (category === 'Paid Games' && coupon) embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);

		await client.sendWebhookMessageToGuilds(webhookCategory, embed);
	}
};

const handleBlogPosts = async (client: Bot, category: Extract<DealsCategory, 'Bundles' | 'Prime Gaming' | 'Sales'>) => {
	const { title, url, lead, image } = await DealsApi.getLatestBlogNews(category);
	if (!title || !url) return;

	const { isDuplicated } = await client.manageState('Deals', category, title, url);
	if (isDuplicated) return;

	const webhookCategory = getWebhookCategory(category);

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(url)
		.setThumbnail(image)
		.setDescription(lead ?? 'N/A')
		.setColor('Random');

	await client.sendWebhookMessageToGuilds(webhookCategory, embed);
};
