import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { NintendoApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.Nintendo,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = await NintendoApi.getLatestNintendoNews();
	if (articles.length === 0) return;

	const {
		0: { title, url, image },
	} = articles;

	const hasEntry = await client.manageState('Nintendo', 'News', title, url);
	if (hasEntry) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, 'Nintendo');
		if (!webhook) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setColor('Random');

		await webhook.send({ embeds: [embed] });
	}
};
