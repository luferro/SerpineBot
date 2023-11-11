import { RSSModel } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const data = [...(await getNews({ client })), ...(await getFeedNews({ client }))];

	const embeds = [];
	for (const { title, url, image, isTwitterEmbed, isYoutubeEmbed } of data.reverse()) {
		if (isYoutubeEmbed && (await client.scraper.youtube.getSubscribers({ url })) < 50_000) continue;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			await client.propageMessage({ category: 'Gaming News', content: `**${title}**\n${url}` });
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		if (image) embed.setThumbnail(image);

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Gaming News', embeds });
};

const getNews = async ({ client }: Parameters<typeof execute>[0]) => {
	const data = await client.api.reddit.getPosts({ subreddit: 'Games', sort: 'new', limit: 25 });
	return data
		.filter(({ isCrosspost, isSelf }) => !isCrosspost || !isSelf)
		.map(({ title, url, isYoutubeEmbed, isTwitterEmbed, publishedAt }) => ({
			title,
			url,
			publishedAt,
			isYoutubeEmbed,
			isTwitterEmbed,
			image: null,
		}));
};

const getFeedNews = async ({ client }: Parameters<typeof execute>[0]) => {
	const feeds = (await RSSModel.getFeeds({ key: 'gaming.news' })).map((feed) => ({
		feed,
		options: { image: { selector: 'img' } },
	}));
	const data = await client.scraper.rss.consume({ feeds });
	return data.map(({ title, url, image, publishedAt }) => ({
		title,
		url,
		image,
		publishedAt,
		isYoutubeEmbed: false,
		isTwitterEmbed: false,
	}));
};
