import { toSeconds } from "@luferro/utils/time";
import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class HowLongToBeatCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "reviews",
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("reviews")
					.setDescription("How well did a game fare?")
					.addStringOption((command) => command.setName("game").setDescription("Game title").setRequired(true)),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const query = interaction.options.getString("game", true);

		const results = await this.container.gql.reviews.search({ query });
		if (results.length === 0) throw new Error("No aggregate results found.");

		const { title, url, releaseDate, platforms, aggregateRating, image } = await this.container.gql.reviews.getReview({
			url: results[0].url,
		});
		if (!aggregateRating?.tier || !aggregateRating?.ratingValue) throw new Error("Not enough reviews are out.");

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(aggregateRating.tier)
			.setImage(image)
			.addFields([
				{
					name: "**Release date**",
					value: releaseDate ? `<t:${toSeconds(new Date(releaseDate).getTime())}:d>` : "Coming soon",
				},
				{
					name: "**Available on**",
					value: platforms.join("\n") || "n/a",
				},
				{
					name: "**Score**",
					value: `**${aggregateRating.ratingValue.toString()}**`,
					inline: true,
				},
				{
					name: "**Reviews count**",
					value: aggregateRating.reviewCount?.toString() ?? "n/a",
					inline: true,
				},
			])
			.setColor("Random");

		await interaction.editReply({ embeds: [embed] });
	}
}
