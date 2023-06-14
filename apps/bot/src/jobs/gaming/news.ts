import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const data = [...(await getArticles(client)), ...(await getMedia(client))].sort(
		(a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
	);

	const embeds = [];
	for (const { title, url, image, isTwitterEmbed, isYoutubeEmbed } of data.reverse()) {
		if (isYoutubeEmbed) {
			const { channel } = await client.api.google.youtube.getVideoDetails(url);
			if (typeof channel.subscribers === 'number' && channel.subscribers < 50_000) continue;
		}

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			const content = `**${title}**\n${isTwitterEmbed ? url.split('?')[0] : url}`;
			await client.propageMessage({ category: 'Gaming News', content });
			continue;
		}

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setColor('Random');
		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Gaming News', embeds });
};

const getArticles = async (client: Bot) => {
	return (await client.api.gaming.news.getLatestNews()).map(({ title, url, image, publishedAt }) => ({
		title,
		url,
		image,
		publishedAt,
		isYoutubeEmbed: false,
		isTwitterEmbed: false,
	}));
};

const getMedia = async (client: Bot) => {
	return (await client.api.reddit.getPosts('Games', 'new', 25))
		.filter(({ isCrosspost, isSelf, hasEmbeddedMedia }) => !isCrosspost && !isSelf && hasEmbeddedMedia)
		.map(({ title, url, embedType, publishedAt }) => ({
			title,
			url,
			publishedAt,
			image: null,
			isYoutubeEmbed: embedType === 'youtube.com',
			isTwitterEmbed: embedType === 'twitter.com',
		}));
};
