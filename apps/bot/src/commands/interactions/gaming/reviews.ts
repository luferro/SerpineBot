import { formatDate } from "@luferro/helpers/datetime";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.reviews.name"))
	.setDescription(t("interactions.gaming.reviews.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.gaming.reviews.options.0.name"))
			.setDescription(t("interactions.gaming.reviews.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction, localization = {} }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data.options[0].name, true);

	const results = await client.api.gaming.games.reviews.search(query);
	if (results.length === 0) throw new Error(t("errors.search.lookup", { query }));
	const { id, slug } = results[0];

	const review = await client.api.gaming.games.reviews.getReviewsByIdAndSlug(id, slug);
	const { title, url, releaseDate, platforms, tier, score, count, recommended, image } = review;
	if (!tier || !score) throw new Error(t("errors.search.lookup", { query }));

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setURL(url)
		.setThumbnail(tier)
		.setImage(image)
		.addFields([
			{
				name: t("interactions.gaming.reviews.embed.fields.0.name"),
				value: releaseDate
					? formatDate(releaseDate, { format: "dd-MM-yyyy", ...localization })
					: t("common.unavailable"),
			},
			{
				name: t("interactions.gaming.reviews.embed.fields.1.name"),
				value: platforms.join("\n") || t("common.unavailable"),
			},
			{
				name: t("interactions.gaming.reviews.embed.fields.2.name"),
				value: score ?? t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.gaming.reviews.embed.fields.3.name"),
				value: count ?? t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.gaming.reviews.embed.fields.4.name"),
				value: recommended ?? t("common.unavailable"),
				inline: true,
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
