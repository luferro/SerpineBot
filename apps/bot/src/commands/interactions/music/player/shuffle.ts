import { SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import { Bot } from "~/structures/Bot.js";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.shuffle.name"))
	.setDescription(t("interactions.music.player.shuffle.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || queue.isEmpty()) throw new Error(t("errors.player.node"));

	queue.tracks.shuffle();

	await Bot.commands.interactions.methods.get("music.queue.list")?.execute({ client, interaction, localization });
};
