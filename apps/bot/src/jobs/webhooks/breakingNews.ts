import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { Country, GNewsApi } from '@luferro/gnews-api';
import { JobName } from '../../types/enums';
import type { WebhookCategory } from '../../types/category';

export const data: JobData = {
	name: JobName.BreakingNews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const news = [
		...(await GNewsApi.getBreakingNews()).slice(0, 20),
		...(await GNewsApi.getNewsByCountry(Country.Portugal)).slice(0, 20),
	].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

	for (const { country, title, url, publisher, description, image, publishedAt } of news.reverse()) {
		const category: WebhookCategory = country === Country.Portugal ? 'Portugal News' : 'World News';

		const { isDuplicated } = await client.manageState(data.name, category, title, url);
		if (isDuplicated) continue;

		const embed = new EmbedBuilder()
			.setAuthor({ name: publisher.name, url: publisher.url })
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setThumbnail(image)
			.setTimestamp(publishedAt)
			.setColor('Random');

		await client.sendWebhookMessageToGuilds(category, embed);
	}
};
