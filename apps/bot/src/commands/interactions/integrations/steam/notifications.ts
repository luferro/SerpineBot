import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName("notifications")
	.setDescription("Toggle notifications on or off for your Steam integration.")
	.addBooleanOption((option) => option.setName("toggle").setDescription("Notifications toggle.").setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });
	const toggle = interaction.options.getBoolean(data.options[0].name, true);

	const exists = await client.prisma.steam.exists({ where: { userId: interaction.user.id } });
	if (!exists) throw new Error("errors.unprocessable");

	const integration = await client.prisma.steam.findUnique({ where: { userId: interaction.user.id } });
	if (!integration) throw new Error(t("errors.unprocessable"));

	await client.prisma.steam.update({
		where: { userId: interaction.user.id },
		data: { notifications: toggle },
	});

	const embed = new EmbedBuilder()
		.setTitle(
			t("interactions.integrations.steam.notifications.embed.title", {
				state: toggle ? t("common.toggle.on") : t("common.toggle.off"),
			}),
		)
		.setColor("Random");

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
