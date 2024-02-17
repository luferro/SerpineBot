import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const { subreddits } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.NINTENDO });
	for (const { subreddit, flairs } of subreddits) {
		const posts = await client.api.reddit.getPosts({ subreddit, flairs, sort: "new" });

		const messages = [];
		for (const { title, url, isTwitterEmbed, isYoutubeEmbed, isSelf } of posts.reverse()) {
			if (isSelf) continue;

			if (isTwitterEmbed || isYoutubeEmbed) {
				messages.push(`**${title}**\n${url}`);
				continue;
			}

			const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor("Random");
			messages.push(embed);
		}

		await client.propagate({ type: WebhookType.NINTENDO, messages });
	}
};
