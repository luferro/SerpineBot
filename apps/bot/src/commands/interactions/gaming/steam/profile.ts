import { DateUtil } from "@luferro/shared-utils";
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";

import { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.steam.profile.name"))
	.setDescription(t("interactions.gaming.steam.profile.description"))
	.addMentionableOption((option) =>
		option
			.setName(t("interactions.gaming.steam.profile.options.0.name"))
			.setDescription(t("interactions.gaming.steam.profile.options.0.description")),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	await interaction.deferReply();
	const mention = interaction.options.getMentionable(data.options[0].name) as GuildMember | null;

	const integration = await client.prisma.steam.findUnique({
		where: { userId: mention?.user.id ?? interaction.user.id },
	});
	if (!integration) throw new Error(t("errors.unprocessable"));
	const { id, url } = integration.profile;

	const { name, image, status, logoutAt, createdAt } = await client.api.gaming.platforms.steam.getProfile({ id });

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setThumbnail(image)
		.addFields([
			{
				name: t("interactions.gaming.steam.profile.embed.fields.0.name"),
				value: id,
			},
			{
				name: t("interactions.gaming.steam.profile.embed.fields.1.name"),
				value: status,
			},
			{
				name: t("interactions.gaming.steam.profile.embed.fields.2.name"),
				value: DateUtil.format({ date: createdAt, ...localization }),
				inline: true,
			},
			{
				name: t("interactions.gaming.steam.profile.embed.fields.3.name"),
				value: DateUtil.format({ date: logoutAt, ...localization }),
				inline: true,
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
