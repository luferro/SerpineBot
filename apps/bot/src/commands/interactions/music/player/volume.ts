import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.volume.name"))
	.setDescription(t("interactions.music.player.volume.description"))
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.music.player.volume.options.0.name"))
			.setDescription(t("interactions.music.player.volume.options.0.description"))
			.setMinValue(0)
			.setMaxValue(100)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const volume = interaction.options.getInteger(data.options[0].name, true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	queue.node.setVolume(volume);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.volume.embed.title", { volume }))
		.setColor("Random");
	await interaction.reply({ embeds: [embed] });
};
