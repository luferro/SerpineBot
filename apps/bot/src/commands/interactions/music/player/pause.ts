import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.pause.name"))
	.setDescription(t("interactions.music.player.pause.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error(t("errors.player.playback.nothing"));

	queue.node.setPaused(true);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.pause.embed.title", { track: queue.currentTrack }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
