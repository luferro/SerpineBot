import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Playstation from '../../apis/playstation';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { PlayStationBlogCategory, WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.PlayStation,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const categories = Object.keys(PlayStationBlogCategory)
		.filter((element) => !isNaN(Number(element)))
		.map(Number) as PlayStationBlogCategory[];

	for (const category of categories) {
		const articles = await Playstation.getLatestPlaystationBlogNews(category);
		if (articles.length === 0) continue;

		const {
			0: { title, url, image },
		} = articles;

		const hasEntry = await client.manageState('PlayStation', PlayStationBlogCategory[category], title, url);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Xbox);
			if (!webhook) continue;

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			if (category === PlayStationBlogCategory.PlayStationPlus) embed.setImage(image);
			else embed.setThumbnail(image);

			await webhook.send({ embeds: [embed] });
		}
	}
};
