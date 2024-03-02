import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const { feeds } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.PLAYSTATION });
	const feed = await client.scraper.rss.consume(feeds);

	const messages = [];
	for (const { title, url, image } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setImage(image)
			.setURL(url)
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.PLAYSTATION, messages });
};
