import { Webhook } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

enum Category {
	StateOfPlay = 'State Of Play',
	PlayStationPlus = 'PlayStation Plus',
	PlayStationStore = 'PlayStation Store',
}

export const data: JobData = {
	name: JobName.PlayStation,
	schedule: '0 */10 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const data = [
		await getBlogData(client, Category.StateOfPlay),
		await getBlogData(client, Category.PlayStationPlus),
		await getBlogData(client, Category.PlayStationStore),
	].filter((item): item is NonNullable<typeof item> => !!item);

	for (const { webhook, embeds } of data) {
		await client.propageMessages(webhook, embeds);
	}
};

const getBlogData = async (client: Bot, category: Category) => {
	const select = {
		[Category.StateOfPlay]: client.api.gaming.playstation.getLatestStateOfPlayEvents,
		[Category.PlayStationPlus]: client.api.gaming.playstation.getLatestPlusAdditions,
		[Category.PlayStationStore]: client.api.gaming.playstation.getLatestStoreSales,
	};
	const articles = await select[category]();

	const embeds = [];
	for (const { title, url, image } of articles) {
		const isSuccessful = await client.state.entry({ job: data.name, category, data: { title, url } }).update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embed[category === Category.PlayStationPlus ? 'setImage' : 'setThumbnail'](image);

		embeds.push(embed);
	}

	return { webhook: Webhook.PlayStation, embeds };
};
