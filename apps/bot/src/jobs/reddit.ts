import { FeedType, type Options } from "@luferro/database";
import { truncate } from "@luferro/helpers/transform";
import { EmbedBuilder } from "discord.js";
import type { JobData, JobExecute } from "~/types/bot.js";

type Feeds = { subreddit: string; options: Omit<Options, "image"> }[];
type GroupedFeeds = Map<string, Feeds>;

export const data: JobData = { schedule: "0 */8 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const data = await client.db.feeds.getFeeds({ type: FeedType.REDDIT });
	const grouped = data.reduce<GroupedFeeds>((acc, { feed, options, webhook }) => {
		const { sort, flairs, limit } = options;
		const key = `${FeedType.REDDIT}:${webhook.id}:${feed}`;
		const entry = { subreddit: feed!, options: { sort, flairs, limit } };
		const storedEntry = acc.get(key);
		acc.set(key, storedEntry ? storedEntry.concat(entry) : [entry]);
		return acc;
	}, new Map());

	for (const [key, feeds] of grouped) {
		const messages = [];
		for (const { subreddit, options } of feeds) {
			const posts = await client.api.reddit.getPosts(subreddit, options);
			for (const post of posts.reverse()) {
				const {
					title,
					url,
					selfurl,
					hasEmbeddedMedia,
					isTwitterEmbed,
					isYoutubeEmbed,
					isSelf,
					isImage,
					isGallery,
					gallery,
				} = post;
				if (isSelf) continue;

				const subscribers = isYoutubeEmbed ? await client.scraper.youtube.getSubscribers(url) : 0;
				if (isYoutubeEmbed && subscribers < 50_000) continue;

				if (hasEmbeddedMedia || isTwitterEmbed || isYoutubeEmbed) {
					messages.push(
						isTwitterEmbed || isYoutubeEmbed
							? `**${title}**\n${url}`
							: `**[${truncate(title)}](<${selfurl}>)**\n${url}`,
					);
					continue;
				}

				const getUrl = () => (!isImage && !isGallery ? url : selfurl);

				const getImage = () => {
					if (!isImage && !isGallery) return null;
					if (isGallery) return gallery[0].url;
					return url;
				};

				const embed = new EmbedBuilder()
					.setTitle(truncate(title))
					.setURL(getUrl())
					.setImage(getImage())
					.setColor("Random");
				messages.push(embed);
			}
		}
		const webhookId = key.split(":")[1];
		await client.propagateToWebhook({ type: FeedType.REDDIT, webhookId, messages });
	}
};
