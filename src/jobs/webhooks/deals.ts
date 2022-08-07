import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as GGDeals from '../../apis/ggDeals';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';
import { DealsCategory, WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Deals,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const categories = Object.keys(DealsCategory)
		.filter((element) => !isNaN(Number(element)))
		.map(Number) as DealsCategory[];

	for (const category of categories) {
		if (category === DealsCategory.FreeGames || category === DealsCategory.PaidGames) {
			const deals = await GGDeals.getLatestDeals(category);
			for (const { title, url, image, store, discount, regular, discounted, coupon } of deals.reverse()) {
				const hasEntry = await client.manageState('Deals', DealsCategory[category], title, url);
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

				if (category === DealsCategory.PaidGames && coupon)
					embed.addFields([{ name: 'Store coupon', value: `*${coupon}*` }]);

				await sendMessage(client, category, embed);
				await SleepUtil.timeout(5000);
			}
			continue;
		}

		const { title, url, lead, image } = await GGDeals.getLatestBlogNews(category);
		if (!title || !url) continue;

		const hasEntry = await client.manageState('Deals', DealsCategory[category], title, url);
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
	if (category === DealsCategory.FreeGames || category === DealsCategory.PrimeGaming)
		return await Webhooks.getWebhook(client, guildId, WebhookCategory.FreeGames);

	return await Webhooks.getWebhook(client, guildId, WebhookCategory.Deals);
};

const sendMessage = async (client: Bot, category: DealsCategory, embed: EmbedBuilder) => {
	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await getWebhook(client, guildId, category);
		if (!webhook) continue;

		await webhook.send({ embeds: [embed] });
	}
};
