import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	for (const blog of ['PLAYSTATION_PLUS', 'STATE_OF_PLAY', 'PLAYSTATION_STORE', 'PODCAST'] as const) {
		const articles = await client.api.gaming.playstation.getBlog({ blog });

		const embeds = [];
		for (const { title, url, image } of articles) {
			const isSuccessful = await client.state({ title, url });
			if (!isSuccessful) continue;

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setImage(image)
				.setURL(url)
				.setColor('Random');

			embeds.push(embed);
		}

		await client.propageMessages({ category: 'PlayStation', embeds });
	}
};
