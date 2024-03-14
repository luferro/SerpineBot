import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.birthdays.delete.name"))
	.setDescription(t("interactions.birthdays.delete.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await client.prisma.birthday.delete({ where: { userId: interaction.user.id } });
	const embed = new EmbedBuilder().setTitle(t("interactions.birthdays.delete.embed.title")).setColor("Random");
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
