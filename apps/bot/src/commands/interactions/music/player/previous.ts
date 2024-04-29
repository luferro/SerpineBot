import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.previous.name"))
	.setDescription(t("interactions.music.player.previous.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.history.previousTrack) throw new Error(t("errors.player.playback.previous"));

	await queue.history.previous();

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.previous.embed.title", { track: `\`${queue.history.currentTrack}\`` }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
