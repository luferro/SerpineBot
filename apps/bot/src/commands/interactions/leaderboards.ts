import { ObjectUtil } from "@luferro/shared-utils";
import { EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { t } from "i18next";
import { LeaderboardType, getLeaderboard } from "../../helpers/leaderboards";
import type { InteractionCommandData, InteractionCommandExecute } from "../../types/bot";

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t("interactions.leaderboards.options.0.name"))
		.setDescription(t("interactions.leaderboards.options.0.description"))
		.addChoices(
			...ObjectUtil.enumToArray(LeaderboardType).map((type) => ({
				name: LeaderboardType[type],
				value: LeaderboardType[type],
			})),
		)
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const type = interaction.options.getString(data[0].name, true) as LeaderboardType;

	const leaderboard = await getLeaderboard(type, client);
	if (leaderboard.length === 0) throw new Error(t("errors.leaderboards.empty"));

	const formattedLeaderboard = leaderboard.map(({ position, medal, user, highlight }) =>
		t("interactions.leaderboards.embed.description", {
			position: medal ?? `\`${position}.\``,
			username: user.username,
			highlight: highlight.formatted,
		}),
	);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.leaderboards.embed.title", { type }))
		.setDescription(formattedLeaderboard.join("\n"))
		.setFooter({ text: t("interactions.leaderboards.embed.footer.text") })
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
