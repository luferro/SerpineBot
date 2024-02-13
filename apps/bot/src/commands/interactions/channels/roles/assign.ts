import { randomUUID } from "crypto";
import {
	ActionRowBuilder,
	ChannelType,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { t } from "i18next";

import { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.channels.roles.assign.name"))
	.setDescription(t("interactions.channels.roles.assign.description"))
	.addChannelOption((option) =>
		option
			.setName(t("interactions.channels.roles.assign.options.0.name"))
			.setDescription(t("interactions.channels.roles.assign.options.0.description"))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel(data.options[0].name, true);

	const uuid = randomUUID();
	const options = interaction.guild.roles.cache
		.sort((a, b) => a.position - b.position)
		.filter((role) => role.id !== interaction.guild.roles.everyone.id)
		.map((role) => ({ label: role.name, value: role.id }));

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle(t("interactions.channels.roles.assign.menu.title")).setColor("Random")],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId(uuid)
					.setPlaceholder(t("interactions.channels.roles.assign.menu.placeholder"))
					.setMaxValues(options.length)
					.addOptions(options),
			),
		],
		ephemeral: true,
	});

	const componentInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!componentInteraction) throw new Error(t("errors.interaction.timeout"));

	await client.prisma.guild.update({
		where: { id: interaction.guild.id },
		data: { roles: { channelId: channel.id, options: componentInteraction.values } },
	});

	const updatedEmbed = new EmbedBuilder()
		.setTitle(t("interactions.channels.roles.assign.embed.title", { channel: channel.name }))
		.setColor("Random");

	await componentInteraction.update({ embeds: [updatedEmbed], components: [] });
	client.emit("rolesMessageUpdate", client);
};
