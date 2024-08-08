import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandAutoComplete, InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.hltb.name"))
	.setDescription(t("interactions.gaming.hltb.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.gaming.hltb.options.0.name"))
			.setDescription(t("interactions.gaming.hltb.options.0.description"))
			.setRequired(true)
			.setAutocomplete(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data.options[0].name, true);

	const { title, url, image, playtimes } = await client.api.gaming.games.hltb.getPlaytimesById(query);
	const { main, mainExtra, completionist } = playtimes;

	const hasPlaytimes = main || mainExtra || completionist;
	if (!hasPlaytimes) throw new Error(t("errors.search.lookup", { query }));

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.gaming.hltb.embed.title", { game: `\`${title}\`` }))
		.setURL(url)
		.setThumbnail(image)
		.addFields([
			{
				name: t("interactions.gaming.hltb.embed.fields.0.name"),
				value: main ? `~${main}` : t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.gaming.hltb.embed.fields.1.name"),
				value: mainExtra ? `~${mainExtra}` : t("common.unavailable"),
				inline: true,
			},
			{
				name: t("interactions.gaming.hltb.embed.fields.2.name"),
				value: completionist ? `~${completionist}` : t("common.unavailable"),
				inline: true,
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};

export const autocomplete: InteractionCommandAutoComplete = async ({ client, interaction }) => {
	const { value: query } = interaction.options.getFocused(true);
	if (query.length < 3) return interaction.respond([]);

	const results = await client.api.gaming.games.hltb.search(query);
	const slicedResults = results.slice(0, 10);
	const getOccurrences = (title: string) => slicedResults.reduce((acc, el) => acc + (el.title === title ? 1 : 0), 0);

	await interaction.respond(
		results.slice(0, 10).map((item) => {
			const occurrences = getOccurrences(item.title);
			return {
				name: occurrences < 2 ? item.title : `${item.title} (${item.releaseYear})`,
				value: item.id,
			};
		}),
	);
};
