import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.integrations.steam.import.name"))
	.setDescription(t("interactions.integrations.steam.import.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.integrations.steam.import.options.0.name"))
			.setDescription(t("interactions.integrations.steam.import.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });
	const profile = interaction.options.getString(data.options[0].name, true);

	const exists = await client.prisma.steam.exists({ where: { userId: interaction.user.id } });
	if (exists) throw new Error(t("errors.unprocessable"));

	const url = profile.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
	if (!url) throw new Error(t("errors.steam.profile.url"));

	const { 1: type, 2: id } = url;
	const steamId64 = type === "id" ? await client.api.gaming.platforms.steam.getSteamId64(id) : id;
	if (!steamId64) throw new Error(t("errors.steam.steamId64"));

	const rawWishlist = await client.api.gaming.platforms.steam.getWishlist(steamId64);
	if (!rawWishlist) throw new Error(t("errors.steam.wishlist.private"));
	const wishlist = await Promise.all(
		rawWishlist.map(async (game) => {
			const subscriptions = await client.prisma.subscription.search({ query: game.title });
			return { ...game, subscriptions: subscriptions.map((subscription) => subscription.type) };
		}),
	);

	const recentlyPlayed = await client.api.gaming.platforms.steam.getRecentlyPlayed(steamId64);

	await client.prisma.steam.create({
		data: {
			wishlist,
			userId: interaction.user.id,
			profile: { id: steamId64, url: `https://steamcommunity.com/profiles/${steamId64}` },
			recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })),
		},
	});

	const embed = new EmbedBuilder().setTitle(t("interactions.integrations.steam.import.embed.title")).setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
