import { FeedType } from "@luferro/database";
import { formatDate } from "@luferro/helpers/datetime";
import { enumToArray } from "@luferro/helpers/transform";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import { LeaderboardType, getLeaderboard, resetLeaderboard } from "~/helpers/leaderboards.js";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 0 0 * * 0" };

export const execute: JobExecute = async ({ client }) => {
	for (const type of enumToArray(LeaderboardType)) {
		try {
			const leaderboard = await getLeaderboard(type, client);
			if (leaderboard.length === 0) continue;

			const localization = client.getLocalization();
			const from = formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000, localization);
			const to = formatDate(Date.now(), localization);

			const formattedLeaderboard = leaderboard.map(({ position, medal, user, highlight, item }) =>
				t("jobs.leaderboards.embed.description", {
					position: medal ?? `\`${position}.\``,
					username: user.username,
					highlight: highlight.formatted,
					item: item.url ? `[${item.title}](${item.url})` : item.title,
				}),
			);

			await client.propagate({
				type: FeedType.LEADERBOARDS,
				messages: [
					new EmbedBuilder()
						.setTitle(t("jobs.leaderboards.embed.title", { type, from, to }))
						.setDescription(formattedLeaderboard.join("\n"))
						.setColor("Random"),
				],
			});
			client.logger.info(`Leaderboards | ${type} has been created`);
		} finally {
			await resetLeaderboard(type, client);
			client.logger.info(`Leaderboards | ${type} has been reset`);
		}
	}
};
