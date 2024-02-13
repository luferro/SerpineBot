import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Track } from "discord-player";
import { t } from "i18next";

import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.queue.list.name"))
	.setDescription(t("interactions.music.queue.list.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const formatTrack = (track: Track) => `**[${track.title}](${track.url})** | **${track.duration}**`;

	const formattedQueue = queue.tracks
		.toArray()
		.slice(0, 10)
		.map((track, index) => `\`${index + 1}.\` ${formatTrack(track)}`);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.queue.list.embed.title", { guild: interaction.guild.name }))
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: t("interactions.music.queue.list.embed.fields.0.name"),
				value: queue.currentTrack ? formatTrack(queue.currentTrack) : t("common.player.playback.nothing"),
			},
			{
				name: t("interactions.music.queue.list.embed.fields.1.name"),
				value: formattedQueue.join("\n") || t("common.player.queue.empty"),
			},
		])
		.setFooter({ text: t("interactions.music.queue.list.embed.footer.text", { size: queue.size }) })
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
