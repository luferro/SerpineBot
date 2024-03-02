import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const messages = [];
	const { subreddits, feeds } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.GAMING_NEWS });

	for (const { subreddit, flairs } of subreddits) {
		const posts = await client.api.reddit.getPosts(subreddit, { flairs, sort: "new", limit: 25 });
		for (const { title, url, isTwitterEmbed, isYoutubeEmbed, isSelf, isCrosspost } of posts.reverse()) {
			if (isSelf || isCrosspost) continue;

			if (isTwitterEmbed || isYoutubeEmbed) {
				if (isYoutubeEmbed && (await client.scraper.youtube.getSubscribers(url)) < 50_000) continue;
				messages.push(`**${title}**\n${url}`);
				continue;
			}

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor("Random");
			messages.push(embed);
		}
	}

	const feed = await client.scraper.rss.consume(feeds);
	for (const { title, url, image } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setThumbnail(image)
			.setURL(url)
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.GAMING_NEWS, messages });
};
