import { FeedType, type Options } from "@luferro/database";
import { truncate } from "@luferro/helpers/transform";
import { EmbedBuilder } from "discord.js";
import type { JobData, JobExecute } from "~/types/bot.js";

type Feeds = { url: string; options: Pick<Options, "image"> }[];
type GroupedFeeds = Map<string, Feeds>;

export const data: JobData = { schedule: "0 */15 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const data = await client.db.feeds.getFeeds({ type: FeedType.RSS });
	const groupedFeeds = data.reduce<GroupedFeeds>((acc, { feed, options, webhook }) => {
		const { image } = options;
		const key = `${FeedType.RSS}:${webhook.id}:${feed}`;
		const entry = { url: feed!, options: { image } };
		const storedEntry = acc.get(key);
		acc.set(key, storedEntry ? storedEntry.concat(entry) : [entry]);
		return acc;
	}, new Map());

	for (const [key, feeds] of groupedFeeds) {
		const messages = [];
		const data = await client.scraper.rss.consume(feeds);
		for (const { title, url, image } of data.reverse()) {
			if (client.scraper.youtube.isVideo(url)) {
				messages.push(`**${title}**\n${url}`);
				continue;
			}

			const embed = new EmbedBuilder().setTitle(truncate(title)).setThumbnail(image).setURL(url).setColor("Random");
			messages.push(embed);
		}
		const webhookId = key.split(":")[1];
		await client.propagate({ type: FeedType.RSS, webhookId, messages });
	}
};
