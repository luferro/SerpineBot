import type { Bot } from '../../structures/bot';
import type { DealsCategory } from '@luferro/games-api';
import { EmbedBuilder } from 'discord.js';
import { DealsApi } from '@luferro/games-api';
import { StringUtil, SleepUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.Deals,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: DealsCategory[] = ['Bundles', 'Free Games', 'Paid Games', 'Prime Gaming', 'Sales'];

	for (const category of categories) {
		if (category === 'Free Games' || category === 'Paid Games') {
			const deals = await DealsApi.getLatestDeals(category);
			for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
				const hasEntry = await client.manageState('Deals', category, title, url);
				if (hasEntry) continue;

				const description = `${
					discount && regular ? `**${discount}** off! ~~${regular}~~ |` : ''
				} **${discounted}** @ **${store}**`;

				const embed = new EmbedBuilder()
					.setTitle(title)
					.setURL(url)
					.setThumbnail(image)
					.setDescription(description)
					.setColor('Random');

				if (category === 'Paid Games' && coupon)
					embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);

				await sendMessage(client, category, embed);
				await SleepUtil.sleep(5000);
			}
			continue;
		}

		const { title, url, lead, image } = await DealsApi.getLatestBlogNews(category);
		if (!title || !url) continue;

		const hasEntry = await client.manageState('Deals', category, title, url);
		if (hasEntry) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setDescription(lead ?? 'N/A')
			.setColor('Random');

		await sendMessage(client, category, embed);
	}
};

const getWebhook = async (client: Bot, guildId: string, category: DealsCategory) => {
	if (category === 'Free Games' || category === 'Prime Gaming')
		return await Webhooks.getWebhook(client, guildId, 'Free Games');

	return await Webhooks.getWebhook(client, guildId, 'Deals');
};

const sendMessage = async (client: Bot, category: DealsCategory, embed: EmbedBuilder) => {
	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await getWebhook(client, guildId, category);
		if (!webhook) continue;

		await webhook.send({ embeds: [embed] });
	}
};
