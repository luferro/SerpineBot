import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	for (const blog of ['DEALS_WITH_GOLD', 'GAME_PASS', 'GAMES_WITH_GOLD', 'PODCAST'] as const) {
		const articles = await client.api.gaming.xbox.getBlog({ blog });

		const embeds = [];
		for (const { title, url, image } of articles.reverse()) {
			const isSuccessful = await client.state({ title, url });
			if (!isSuccessful) continue;

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setThumbnail(image)
				.setURL(url)
				.setColor('Random');

			embeds.push(embed);
		}

		await client.propageMessages({ category: 'Xbox', embeds });
	}
};
