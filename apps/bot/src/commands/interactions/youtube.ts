import { truncate } from "@luferro/helpers/transform";
import { SlashCommandStringOption } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandAutoComplete, InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

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

export const autocomplete: InteractionCommandAutoComplete = async ({ client, interaction }) => {
	const { value: query } = interaction.options.getFocused(true);
	if (query.length < 3) return interaction.respond([]);

	const results = await client.player.search(query);

	await interaction.respond(
		results.tracks.slice(0, 10).map((item) => {
			const author = item.author;
			const duration = item.duration;
			const limit = 100 - author.length - duration.length - 6;
			return { name: `${author} - ${truncate(item.title, limit)} | ${duration}`, value: item.url };
		}),
	);
};
