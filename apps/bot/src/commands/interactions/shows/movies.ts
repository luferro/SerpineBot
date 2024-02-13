import { DateUtil } from "@luferro/shared-utils";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";

import type {
	InteractionCommandAutoComplete,
	InteractionCommandData,
	InteractionCommandExecute,
} from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.shows.movies.name"))
	.setDescription(t("interactions.shows.movies.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.shows.movies.options.0.name"))
			.setDescription(t("interactions.shows.movies.options.0.description"))
			.setRequired(true)
			.setAutocomplete(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data.options[0].name, true);

	const { name, tagline, overview, url, image, releaseDate, score, duration, genres, providers } =
		await client.api.shows.getMovieById({ id: query });

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(`${tagline ? `*${tagline}*` : ""}\n${overview ?? ""}`.trim())
		.setThumbnail(image)
		.addFields([
			{
				name: t("interactions.shows.movies.embed.fields.0.name"),
				value: releaseDate
					? DateUtil.format({ date: new Date(releaseDate), format: "dd/MM/yyyy", ...localization })
					: t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.shows.movies.embed.fields.1.name"),
				value: score ?? t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.shows.movies.embed.fields.2.name"),
				value: duration ?? t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.shows.movies.embed.fields.3.name"),
				value: genres.map((genre) => `\`${genre.name}\``).join() || t("common.unavailable"),
			},
			{
				name: t("interactions.shows.movies.embed.fields.4.name"),
				value: providers.buy.map((provider) => `\`${provider}\``).join() || t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.shows.movies.embed.fields.5.name"),
				value: providers.rent.map((provider) => `\`${provider}\``).join() || t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.shows.movies.embed.fields.6.name"),
				value: providers.stream.map((provider) => `\`${provider}\``).join() || t("common.unavailable"),
				inline: true,
			},
		])
		.setFooter({ text: t("interactions.shows.movies.embed.footer.text") })
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};

export const autocomplete: InteractionCommandAutoComplete = async ({ client, interaction }) => {
	const { value: query } = interaction.options.getFocused(true);
	if (query.length < 3) return interaction.respond([]);

	const results = await client.api.shows.search({ query });
	await interaction.respond(
		results
			.filter(({ type }) => type === "movie")
			.slice(0, 10)
			.map(({ id, title }) => ({ name: title, value: id.toString() })),
	);
};
