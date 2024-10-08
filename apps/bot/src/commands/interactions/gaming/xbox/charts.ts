import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.xbox.charts.name"))
	.setDescription(t("interactions.gaming.xbox.charts.description"))
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.gaming.xbox.charts.options.0.name"))
			.setDescription(t("interactions.gaming.xbox.charts.options.0.description"))
			.addChoices(
				{ name: t("interactions.gaming.xbox.charts.options.0.choices.0.name"), value: 0 },
				{ name: t("interactions.gaming.xbox.charts.options.0.choices.1.name"), value: 1 },
				{ name: t("interactions.gaming.xbox.charts.options.0.choices.2.name"), value: 2 },
			)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const chart = interaction.options.getInteger(data.options[0].name, true);

	const result = await client.api.gaming.platforms.xbox.getChart(chart);
	if (result.length === 0) throw new Error(t("errors.search.none"));

	const embed = new EmbedBuilder()
		.setTitle(
			t("interactions.gaming.xbox.charts.embed.title", {
				chart: t(`interactions.gaming.xbox.charts.options.0.choices.${chart}.name`),
			}),
		)
		.setDescription(result.map(({ position, name, url }) => `\`${position}.\` [${name}](${url})`).join("\n"))
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
