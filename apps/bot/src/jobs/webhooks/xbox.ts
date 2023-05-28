import { Webhook } from '@luferro/database';
import { EnumUtil, StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

enum Category {
	Podcast = 'Podcast',
	GamePass = 'Game Pass',
	GamesWithGold = 'Games With Gold',
	DealsWithGold = 'Deals With Gold',
}

export const data: JobData = {
	name: JobName.Xbox,
	schedule: '0 */10 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const data = [];
	for (const category of EnumUtil.enumKeysToArray(Category)) {
		data.push(await getBlogData(client, Category[category]));
	}

	for (const { webhook, embeds } of data) {
		await client.propageMessages(webhook, embeds);
	}
};

const getBlogData = async (client: Bot, category: Category) => {
	const select = {
		[Category.Podcast]: client.api.gaming.xbox.getLatestPodcastEpisodes,
		[Category.GamePass]: client.api.gaming.xbox.getLatestGamePassAdditions,
		[Category.GamesWithGold]: client.api.gaming.xbox.getLatestGamesWithGoldAdditions,
		[Category.DealsWithGold]: client.api.gaming.xbox.getLatestDealsWithGold,
	};
	const articles = await select[category]();

	const embeds = [];
	for (const { title, url, image } of articles.reverse()) {
		const isSuccessful = await client.state.entry({ job: data.name, category, data: { title, url } }).update();
		if (!isSuccessful) continue;

		if (client.api.google.youtube.isVideo(url)) {
			const content = `**${StringUtil.truncate(title)}**\n${url}`;
			await client.propageMessage(Webhook.Xbox, content);
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		embed[category === Category.GamePass && /Game(.*?)Pass/gi.test(title) ? 'setImage' : 'setThumbnail'](image);

		embeds.push(embed);
	}

	return { webhook: Webhook.Xbox, embeds };
};
