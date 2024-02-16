import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../types/bot";

export const data: JobData = { schedule: "0 */15 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const { subreddits } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.NSFW });
	for (const subreddit of subreddits) {
		const posts = await client.api.reddit.getPosts({ subreddit, limit: 25 });

		const messages = [];
		for (const { title, url, selfurl, gallery, hasEmbeddedMedia, isSelf } of posts.reverse()) {
			if (isSelf) continue;

			const galleryMediaId = gallery?.items[0].media_id;
			const nsfwUrl = galleryMediaId ? `https://i.redd.it/${galleryMediaId}.jpg` : url;

			if (hasEmbeddedMedia) {
				messages.push(`**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${nsfwUrl}`);
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(nsfwUrl)
				.setColor("Random");

			messages.push(embed);
		}

		await client.propagate({ type: WebhookType.NSFW, messages });
	}
};
