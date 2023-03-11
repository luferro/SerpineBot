import { WebhookCategory } from '@luferro/database';
import { XboxApi } from '@luferro/games-api';
import { YoutubeApi } from '@luferro/google-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Xbox,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	for (const category of XboxApi.getCategories()) {
		const articles = await XboxApi.getLatestXboxWireNews(category);

		for (const { title, url, image } of articles.reverse()) {
			const { isDuplicated } = await client.manageState(data.name, category, title, url);
			if (isDuplicated) continue;

			const message = YoutubeApi.isVideo(url)
				? `**${StringUtil.truncate(title)}**\n${url}`
				: new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');

			if (message instanceof EmbedBuilder) {
				message[category === 'Game Pass' && /Game(.*?)Pass/gi.test(title) ? 'setImage' : 'setThumbnail'](image);
			}

			await client.sendWebhookMessageToGuilds(WebhookCategory.Xbox, message);
		}
	}
};
