import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.integrations.steam.delete.name"))
	.setDescription(t("interactions.integrations.steam.delete.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const exists = await client.prisma.steam.exists({ where: { userId: interaction.user.id } });
	if (!exists) throw new Error("errors.unprocessable");

	await client.prisma.steam.delete({ where: { userId: interaction.user.id } });

	const embed = new EmbedBuilder().setTitle(t("interactions.integrations.steam.delete.embed.title")).setColor("Random");

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
