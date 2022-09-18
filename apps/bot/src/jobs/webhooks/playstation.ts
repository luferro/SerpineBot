import { EmbedBuilder } from 'discord.js';
import type { Bot } from '../../structures/bot';
import type { PlayStationBlogCategory } from '@luferro/games-api';
import { PlayStationApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.PlayStation,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: PlayStationBlogCategory[] = ['PlayStation Plus', 'PlayStation Store', 'State Of Play'];

	for (const category of categories) {
		const articles = await PlayStationApi.getLatestPlaystationBlogNews(category);
		if (articles.length === 0) continue;

		const {
			0: { title, url, image },
		} = articles;

		const hasEntry = await client.manageState('PlayStation', category, title, url);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'PlayStation');
			if (!webhook) continue;

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			if (category === 'PlayStation Plus') embed.setImage(image);
			else embed.setThumbnail(image);

			await webhook.send({ embeds: [embed] });
		}
	}
};
