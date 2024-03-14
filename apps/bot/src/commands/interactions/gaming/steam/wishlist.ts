import { EmbedBuilder, type GuildMember, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.steam.wishlist.name"))
	.setDescription(t("interactions.gaming.steam.wishlist.description"))
	.addMentionableOption((option) =>
		option
			.setName(t("interactions.gaming.steam.wishlist.options.0.name"))
			.setDescription(t("interactions.gaming.steam.wishlist.options.0.description")),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const mention = interaction.options.getMentionable(data.options[0].name) as GuildMember | null;

	const user = mention?.user ?? interaction.user;
	const integration = await client.prisma.steam.findUnique({ where: { userId: user.id } });
	if (!integration) throw new Error(t("errors.unprocessable"));

	const formattedWishlist = integration.wishlist
		.slice(0, 10)
		.map(
			({ priority, title, url, discounted, isFree }) =>
				`\`${priority}.\` **[${title}](${url})** | ${discounted || (isFree && "Free") || t("common.unavailable")}`,
		);

	console.log(formattedWishlist.at(-1));
	const hiddenCount = integration.wishlist.length - formattedWishlist.length;
	if (hiddenCount > 0) formattedWishlist.push(t("common.lists.hidden", { size: hiddenCount }));

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.gaming.steam.wishlist.embed.title", { username: `\`${user.username}\`` }))
		.setURL(`https://store.steampowered.com/wishlist/profiles/${integration.profile.id}/#sort=order`)
		.setDescription(formattedWishlist.join("\n"))
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
