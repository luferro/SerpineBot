import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.integrations.xbox.import.name"))
	.setDescription(t("interactions.integrations.xbox.import.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.integrations.xbox.import.options.0.name"))
			.setDescription(t("interactions.integrations.xbox.import.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });
	const profile = interaction.options.getString(data.options[0].name, true);

	const exists = await client.db.xbox.exists({ where: { userId: interaction.user.id } });
	if (exists) throw new Error(t("errors.unprocessable"));

	const results = await client.api.gaming.platforms.xbox.search(profile);
	if (results.length === 0) throw new Error(t("errors.xbox.profile.gamertag"));
	const { id, gamertag } = results[0];

	const recentlyPlayed = await client.api.gaming.platforms.xbox.getRecentlyPlayed(id);

	await client.db.xbox.create({
		data: {
			userId: interaction.user.id,
			profile: { id, gamertag },
			recentlyPlayed: recentlyPlayed.map((game) => ({
				id: game.id,
				title: game.title,
				currentGamerscore: game.gamerscore.current,
				totalGamerscore: game.gamerscore.total,
				weeklyGamerscore: 0,
			})),
		},
	});

	const embed = new EmbedBuilder().setTitle(t("interactions.integrations.xbox.import.embed.title")).setColor("Random");
	await interaction.editReply({ embeds: [embed] });
};
