import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.destroy.name"))
	.setDescription(t("interactions.music.player.destroy.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	queue.delete();

	const embed = new EmbedBuilder().setTitle(t("interactions.music.player.destroy.embed.title")).setColor("Random");
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
