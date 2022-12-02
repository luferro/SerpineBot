import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import type { XboxWireCategory } from '@luferro/games-api';
import { EmbedBuilder } from 'discord.js';
import { XboxApi } from '@luferro/games-api';
import { YoutubeApi } from '@luferro/google-api';
import { SleepUtil, StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.Xbox,
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const categories: XboxWireCategory[] = ['Deals With Gold', 'Game Pass', 'Games With Gold', 'Podcast'];

	for (const category of categories) {
		const articles = await XboxApi.getLatestXboxWireNews(category);

		for (const { title, url, image } of articles.reverse()) {
			await SleepUtil.sleep(1000);

			const { isDuplicated } = await client.manageState('Xbox', category, title, url);
			if (isDuplicated) continue;

			const message = YoutubeApi.isVideo(url)
				? `**${StringUtil.truncate(title)}**\n${url}`
				: new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');

			if (message instanceof EmbedBuilder) {
				message[category === 'Game Pass' && /Game(.*?)Pass/gi.test(title) ? 'setImage' : 'setThumbnail'](image);
			}

			await client.sendWebhookMessageToGuilds('Xbox', message);
		}
	}
};
