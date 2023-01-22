import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import type { PlayStationBlogCategory } from '@luferro/games-api';
import { EmbedBuilder } from 'discord.js';
import { PlayStationApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.PlayStation,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: PlayStationBlogCategory[] = ['PlayStation Plus', 'PlayStation Store', 'State Of Play'];

	for (const category of categories) {
		const articles = await PlayStationApi.getLatestPlaystationBlogNews(category);

		for (const { title, url, image } of articles) {
			const { isDuplicated } = await client.manageState('PlayStation', category, title, url);
			if (isDuplicated) continue;

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			embed[category === 'PlayStation Plus' ? 'setImage' : 'setThumbnail'](image);

			await client.sendWebhookMessageToGuilds('PlayStation', embed);
		}
	}
};
