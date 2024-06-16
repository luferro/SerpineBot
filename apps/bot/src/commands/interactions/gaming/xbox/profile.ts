import { EmbedBuilder, type GuildMember, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.xbox.profile.name"))
	.setDescription(t("interactions.gaming.xbox.profile.description"))
	.addMentionableOption((option) =>
		option
			.setName(t("interactions.gaming.xbox.profile.options.0.name"))
			.setDescription(t("interactions.gaming.xbox.profile.options.0.description")),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const mention = interaction.options.getMentionable(data.options[0].name) as GuildMember | null;

	const userId = mention?.user.id ?? interaction.user.id;
	const integration = await client.db.xbox.findUnique({ where: { userId } });
	if (!integration) throw new Error(t("errors.unprocessable"));

	const { gamertag, gamerscore, image, status } = await client.api.gaming.platforms.xbox.getProfile(
		integration.profile.id,
	);

	const embed = new EmbedBuilder()
		.setTitle(gamertag)
		.setThumbnail(image)
		.addFields([
			{
				name: t("interactions.gaming.xbox.profile.embed.fields.0.name"),
				value: gamerscore.toString(),
			},
			{
				name: t("interactions.gaming.xbox.profile.embed.fields.1.name"),
				value: status,
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
