import { WebhookType } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */20 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const rss = await client.prisma.rss.findUnique({ where: { webhook: WebhookType.GAME_DEALS } });
	const feed = await client.scraper.rss.consume({ feeds: rss?.feeds ?? [] });

	const messages = [];
	for (const { title, description, image, url } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setImage(image)
			.setURL(url)
			.setDescription(description)
			.setColor('Random');

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.GAME_DEALS, messages });
};
