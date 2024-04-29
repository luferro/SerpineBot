import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.player.jump.name"))
	.setDescription(t("interactions.music.player.jump.description"))
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.music.player.jump.options.0.name"))
			.setDescription(t("interactions.music.player.jump.options.0.description"))
			.setMinValue(1)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger(data.options[0].name, true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const nextTrack = queue.tracks.at(position - 1);
	if (!nextTrack) throw new Error(t("errors.player.queue.tracks.position", { position: `\`${position}\`` }));

	queue.node.jump(nextTrack);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.jump.embed.title", { track: `\`${nextTrack}\`` }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
