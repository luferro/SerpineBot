import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as NewsAPI from '../../apis/newsApi';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';

export const data = {
	name: 'worldNews',
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = await NewsAPI.getLatestArticles();
	if (articles.length === 0) return;

	for (const { title, url } of articles) {
		const hasEntry = await client.manageState('World News', 'News', title, url);
		if (!hasEntry) continue;

		const articleIndex = articles.findIndex(
			({ title: articleTitle, url: articleUrl }) => articleTitle === title && articleUrl === url,
		);
		articles.splice(articleIndex);
		break;
	}

	for (const { title, url, author, description, content, source, urlToImage, publishedAt } of articles.reverse()) {
		const image = /^http(s?)/g.test(urlToImage) ? urlToImage : '';

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'World News');
			if (!webhook) continue;

			await webhook.send({
				embeds: [
					new MessageEmbed()
						.setAuthor({ name: source.name ?? author ?? 'N/A' })
						.setTitle(StringUtil.truncate(title))
						.setURL(url)
						.setThumbnail(image ?? '')
						.setDescription(content ?? description ?? 'N/A')
						.setTimestamp(new Date(publishedAt))
						.setColor('RANDOM'),
				],
			});

			await SleepUtil.timeout(5000);
		}
	}
};
