import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Nintendo from '../../apis/nintendo';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Nintendo,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = await Nintendo.getLatestNintendoNews();
	if (articles.length === 0) return;

	const {
		0: { title, url, image },
	} = articles;

	const hasEntry = await client.manageState('Nintendo', 'News', title, url);
	if (hasEntry) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Nintendo);
		if (!webhook) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setColor('Random');

		await webhook.send({ embeds: [embed] });
	}
};
