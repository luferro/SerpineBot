import { enumToArray } from "@luferro/helpers/transform";
import { QueueRepeatMode } from "discord-player";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.loop.name"))
	.setDescription(t("interactions.music.player.loop.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.music.player.loop.options.0.name"))
			.setDescription(t("interactions.music.player.loop.options.0.description"))
			.setRequired(true)
			.addChoices(...enumToArray(QueueRepeatMode).map((mode) => ({ name: mode.toString(), value: mode.toString() }))),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const mode = interaction.options.getString(data.options[0].name, true) as unknown as QueueRepeatMode;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error(t("errors.player.playback.nothing"));

	queue.setRepeatMode(mode);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.loop.embed.title", { mode: QueueRepeatMode[mode] }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
