import { toTimeUnit } from "@luferro/helpers/datetime";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.seek.name"))
	.setDescription(t("interactions.music.player.seek.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.music.player.seek.options.0.name"))
			.setDescription(t("interactions.music.player.seek.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const timestamp = interaction.options.getString(data.options[0].name, true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const isValidTimestamp = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(timestamp);
	if (!isValidTimestamp || !queue.currentTrack?.duration) throw new Error(t("errors.player.playback.seek.invalid"));

	const duration = getMilliseconds(timestamp);
	const totalDuration = getMilliseconds(queue.currentTrack.duration);

	const isSeekValid = duration > 0 && duration < totalDuration;
	if (!isSeekValid) throw new Error(t("errors.player.playback.seek.beyond", { limit: queue.currentTrack.duration }));

	await queue.node.seek(duration);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.seek.embed.title", { timestamp }))
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};

const getMilliseconds = (timestampToConvert: string) => {
	let totalMilliseconds = 0;
	timestampToConvert
		.split(":")
		.reverse()
		.forEach((time, index) => {
			if (index === 0) totalMilliseconds += toTimeUnit({ time: Number(time), unit: "Seconds" }, "Milliseconds");
			if (index === 1) totalMilliseconds += toTimeUnit({ time: Number(time), unit: "Minutes" }, "Milliseconds");
			if (index === 2) totalMilliseconds += toTimeUnit({ time: Number(time), unit: "Hours" }, "Milliseconds");
		});
	return totalMilliseconds;
};
