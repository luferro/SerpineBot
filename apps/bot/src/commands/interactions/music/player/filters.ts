import { capitalize } from "@luferro/helpers/transform";
import type { FiltersName } from "discord-player";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

type Filter = FiltersName | "off";

const filters: Filter[] = [
	"8D",
	"bassboost",
	"bassboost_low",
	"bassboost_high",
	"compressor",
	"dim",
	"expander",
	"fadein",
	"karaoke",
	"lofi",
	"mono",
	"nightcore",
	"pulsator",
	"reverse",
	"softlimiter",
	"surrounding",
	"vaporwave",
	"vibrato",
	"off",
];

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.filters.name"))
	.setDescription(t("interactions.music.player.filters.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.music.player.filters.options.0.name"))
			.setDescription(t("interactions.music.player.filters.options.0.description"))
			.addChoices(...filters.map((filter) => ({ name: capitalize(filter), value: filter }))),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	interaction.deferReply({ ephemeral: true });
	const filter = interaction.options.getString(data.options[0].name) as Filter;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack || !queue.filters.ffmpeg) throw new Error(`Cannot toggle \`${filter}\` filter.`);

	if (filter === "off") await queue.filters.ffmpeg.setFilters(false);
	else await queue.filters.ffmpeg.toggle(filter.includes("bassboost") ? [filter, "normalizer"] : filter);

	const embed = new EmbedBuilder()
		.setTitle(
			filter !== "off"
				? t("interactions.music.player.filters.embeds.0.title", { filter })
				: t("interactions.music.player.filters.embeds.1.title"),
		)
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
