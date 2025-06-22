import { truncate } from "@luferro/utils/data";
import { getSubscribers } from "@luferro/utils/youtube";
import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { EmbedBuilder } from "discord.js";
import type { WebhookFeedOptions } from "~/types/webhooks.js";

export class RedditTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 */8 * * * *",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		await this.container.propagate("reddit", async ({ feeds }) => {
			const messages = [];
			for (const { path: subreddit, options } of feeds) {
				const { sort, limit, flairs } = options as WebhookFeedOptions;
				const posts = await this.container.gql.reddit.getPosts({ input: { subreddit, sort, limit, flairs } });
				const reversedPosts = posts.slice().reverse();
				for (const {
					isSelf,
					isYoutubeEmbed,
					isImage,
					isGallery,
					title,
					url,
					selfurl,
					gallery,
					publishedAt,
				} of reversedPosts) {
					const subscribers = isYoutubeEmbed ? await getSubscribers(url) : -1;
					if (isSelf || (isYoutubeEmbed && subscribers < 50_000)) continue;

					if (isImage || isGallery) {
						messages.push({
							publishedAt,
							message: new EmbedBuilder()
								.setTitle(truncate(title))
								.setURL(selfurl)
								.setImage(isImage ? url : gallery[0].url)
								.setColor("Random"),
						});
						continue;
					}

					messages.push({
						publishedAt,
						message: isYoutubeEmbed ? `**${title}**\n${url}` : `**[${truncate(title)}](<${selfurl}>)**\n${url}`,
					});
				}
			}
			return {
				name: this.name,
				messages: messages
					.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
					.map(({ message }) => message),
			};
		});
	}
}
