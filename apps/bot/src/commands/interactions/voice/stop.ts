import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.voice.stop.name"))
	.setDescription(t("interactions.voice.stop.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	if (!interaction.member.voice.channel) throw new Error(t("errors.voice.member.channel"));

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error(t("errors.voice.receiver.none"));

	const isListening = receiver.speaking.listeners("start").length > 0;
	if (!isListening) throw new Error(t("errors.voice.standby"));

	receiver.speaking.removeAllListeners("start");

	const embed = new EmbedBuilder().setTitle(t("interactions.voice.stop.embed.title"));
	await interaction.reply({ embeds: [embed] });
};
