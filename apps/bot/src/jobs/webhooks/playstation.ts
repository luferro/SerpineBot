import { WebhookCategory } from '@luferro/database';
import { PlayStationApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.PlayStation,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	for (const category of PlayStationApi.getCategories()) {
		const articles = await PlayStationApi.getLatestPlaystationBlogNews(category);

		for (const { title, url, image } of articles) {
			const { isDuplicated } = await client.manageState(data.name, category, title, url);
			if (isDuplicated) continue;

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
			embed[category === 'PlayStation Plus' ? 'setImage' : 'setThumbnail'](image);

			await client.sendWebhookMessageToGuilds(WebhookCategory.PlayStation, embed);
		}
	}
};
