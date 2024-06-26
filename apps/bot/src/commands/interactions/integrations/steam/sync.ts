import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.integrations.steam.sync.name"))
	.setDescription(t("interactions.integrations.steam.sync.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const exists = await client.db.steam.exists({ where: { userId: interaction.user.id } });
	if (!exists) throw new Error("errors.unprocessable");

	const integration = await client.db.steam.findUnique({ where: { userId: interaction.user.id } });
	if (!integration) throw new Error(t("errors.unprocessable"));

	const rawWishlist = await client.api.gaming.platforms.steam.getWishlist(integration.profile.id);
	if (!rawWishlist) throw new Error(t("errors.steam.wishlist.private"));

	const updatedWishlist = rawWishlist.map((game) => {
		const storedGame = integration.wishlist.find((storedGame) => storedGame.id === game.id);
		return {
			...game,
			notified: {
				sale: storedGame?.notified.sale ?? game.onSale,
				release: storedGame?.notified.release ?? game.isReleased,
			},
		};
	});

	await client.db.steam.update({ where: { userId: interaction.user.id }, data: { wishlist: updatedWishlist } });

	const embed = new EmbedBuilder().setTitle(t("interactions.integrations.steam.sync.embed.title")).setColor("Random");
	await interaction.editReply({ embeds: [embed] });
};
