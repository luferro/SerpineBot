import { SlashCommandStringOption } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t("interactions.youtube.options.0.name"))
		.setDescription(t("interactions.youtube.options.0.description"))
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data[0].name, true);

	const results = await client.player.search(query);
	if (results.isEmpty()) throw new Error(t("errors.search.lookup", { query }));

	await interaction.editReply({ content: results.tracks[0].url });
};
