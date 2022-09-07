import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as NewsAPI from '../../apis/newsApi';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.WorldNews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = await NewsAPI.getLatestArticles();
	if (articles.length === 0) return;

	for (const { title, url } of articles) {
		const hasEntry = await client.manageState('World News', 'News', title, url);
		if (!hasEntry) continue;

		const articleIndex = articles.findIndex(
			({ title: currentTitle, url: currentUrl }) => currentTitle === title && currentUrl === url,
		);
		articles.splice(articleIndex);
		break;
	}

	for (const { title, url, author, description, image, publishedAt } of articles.reverse()) {
		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.WorldNews);
			if (!webhook) continue;

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(url)
				.setDescription(description)
				.setThumbnail(image)
				.setTimestamp(new Date(publishedAt))
				.setColor('Random');
			if (author) embed.setAuthor({ name: author });

			await webhook.send({ embeds: [embed] });

			await SleepUtil.timeout(5000);
		}
	}
};
