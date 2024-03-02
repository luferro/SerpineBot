import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.queue.history.name"))
	.setDescription(t("interactions.music.queue.history.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const { history } = queue;

	const formattedHistory = history.tracks
		.toArray()
		.slice(0, 10)
		.map((track, index) => `\`${index + 1}.\` **[${track.title}](${track.url})** | **${track.duration}**`);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.queue.history.embed.title", { guild: interaction.guild.name }))
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: t("interactions.music.queue.history.embed.fields.0.name"),
				value: formattedHistory.join("\n") || t("common.player.queue.empty"),
			},
		])
		.setFooter({ text: t("interactions.music.queue.history.embed.footer.text", { size: history.tracks.size }) })
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
