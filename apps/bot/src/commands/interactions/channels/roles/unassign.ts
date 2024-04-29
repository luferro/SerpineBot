import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.channels.roles.unassign.name"))
	.setDescription(t("interactions.channels.roles.unassign.description"))
	.addChannelOption((option) =>
		option
			.setName(t("interactions.channels.roles.unassign.options.0.name"))
			.setDescription(t("interactions.channels.roles.unassign.options.0.description"))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel(data.options[0].name, true);

	await client.prisma.guild.update({
		where: { id: interaction.guild.id, roles: { channelId: channel.id } },
		data: { roles: { channelId: null, options: [] } },
	});

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.channels.roles.unassign.options.embed.title", { channel: channel.name }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
