import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Xbox from '../../apis/xbox';
import * as Youtube from '../../apis/youtube';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { WebhookCategory, WebhookJobName, XboxWireCategory } from '../../types/enums';

export const data = {
	name: WebhookJobName.Xbox,
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const categories = Object.keys(XboxWireCategory)
		.filter((element) => !isNaN(Number(element)))
		.map(Number) as XboxWireCategory[];

	for (const category of categories) {
		const articles = await Xbox.getLatestXboxWireNews(category);
		if (articles.length === 0) continue;

		const {
			0: { title, url, image },
		} = articles;

		const hasEntry = await client.manageState('Xbox', XboxWireCategory[category], title, url);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Xbox);
			if (!webhook) continue;

			if (Youtube.isVideo(url)) {
				await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${url}` });
				continue;
			}

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			if (category === XboxWireCategory.Gamepass && title.startsWith('Coming')) embed.setImage(image);
			else embed.setThumbnail(image);

			await webhook.send({ embeds: [embed] });
		}
	}
};
