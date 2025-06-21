import { isToday } from "@luferro/utils/date";
import { toSeconds } from "@luferro/utils/time";
import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { EmbedBuilder } from "discord.js";

export class ReviewsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "*/30 * * * *",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		await this.container.propagate("reviews", async () => {
			const posts = await this.container.gql.reddit.getPosts({
				input: { subreddit: "Games", flairs: ["Review Thread"], sort: "new" },
			});

			const messages = [];
			for (const { selftext, publishedAt } of posts.slice().reverse()) {
				if (!isToday(publishedAt) || !selftext) continue;

				const matches = /\((https?:\/\/(www\.)?(opencritic|metacritic)\.com\/game\/[^\s]+)\)/g.exec(selftext);
				if (!matches) continue;

				const data = await this.container.gql.reviews.getReview({ url: matches[1] });
				if (!data.aggregateRating.tier || !data.aggregateRating.ratingValue) continue;

				messages.push(
					new EmbedBuilder()
						.setTitle(data.title)
						.setURL(data.url)
						.setThumbnail(data.aggregateRating.tier)
						.setImage(data.image)
						.addFields([
							{
								name: "Release date",
								value: data.releaseDate ? `<t:${toSeconds(new Date(data.releaseDate).getTime())}:d>` : "Coming soon",
							},
							{
								name: "Available on",
								value: data.platforms.map((platform) => `> ${platform}`).join("\n") || "n/a",
							},
							{
								name: "Score",
								value: `**${data.aggregateRating.ratingValue}** ${data.aggregateRating.reviewCount ? `(with ${data.aggregateRating.reviewCount} critic reviews)` : ""}`,
							},
						])
						.setColor("Random"),
				);
			}
			return { name: this.name, messages };
		});
	}
}
