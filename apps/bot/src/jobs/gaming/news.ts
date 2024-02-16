import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	await client.propagate({
		type: WebhookType.GAMING_NEWS,
		messages: [...(await getRedditPosts({ client })), ...(await getRssNews({ client }))],
	});
};

const getRedditPosts = async ({ client }: Parameters<typeof execute>[0]) => {
	const posts = await client.api.reddit.getPosts({ subreddit: "Games", sort: "new", limit: 25 });

	const messages = [];
	for (const { title, url, isTwitterEmbed, isYoutubeEmbed, isSelf, isCrosspost } of posts.reverse()) {
		if (isSelf || isCrosspost) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			if (isYoutubeEmbed && (await client.scraper.youtube.getSubscribers({ url })) < 50_000) continue;
			messages.push(`**${title}**\n${url}`);
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor("Random");
		messages.push(embed);
	}

	return messages;
};

const getRssNews = async ({ client }: Parameters<typeof execute>[0]) => {
	const { feeds } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.GAMING_NEWS });
	const feed = await client.scraper.rss.consume({ feeds });

	const messages = [];
	for (const { title, url, image } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setThumbnail(image)
			.setURL(url)
			.setColor("Random");

		messages.push(embed);
	}

	return messages;
};
