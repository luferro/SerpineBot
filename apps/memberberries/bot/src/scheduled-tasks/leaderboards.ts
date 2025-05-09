import { shuffle } from "@luferro/utils/data";
import { toSeconds } from "@luferro/utils/time";
import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { EmbedBuilder } from "discord.js";
import { type InferSelectModel, and, eq, sql } from "drizzle-orm";
import { integrations } from "~/db/schema.js";

// biome-ignore lint/suspicious/noExplicitAny: can be whatever
type Integration<TProfile = any, TLeaderboard = any> = Omit<
	InferSelectModel<typeof integrations>,
	"profile" | "leaderboard"
> & { profile: TProfile; leaderboard: TLeaderboard[] };

type SteamProfile = { id: string };
type SteamLeaderboadItem = Awaited<ReturnType<(typeof container)["gql"]["steam"]["getRecentlyPlayed"]>>[0] & {
	weeklyHours: number;
};

const Medals = Object.freeze(["🥇", "🥈", "🥉"]);

export class LeaderboardsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 0 0 * * 0",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		await this.container.propagate("leaderboards", async () => {
			const leaderboards = [this.updateSteamLeaderboard.bind(this)];

			const integrations = await this.container.db.query.integrations.findMany();

			const messages = [];
			for (const updateLeaderboard of leaderboards) {
				const { title, leaderboard, extras } = await updateLeaderboard(integrations as Integration[]);

				messages.push(
					new EmbedBuilder()
						.setTitle(title)
						.setDescription(leaderboard.join("\n").concat("\n\n").concat(extras.join("\n")))
						.setColor("Random"),
				);
			}
			return messages;
		});
	}

	private async updateSteamLeaderboard(userIntegrations: Integration<SteamProfile, SteamLeaderboadItem>[]) {
		const leaderboard = [];
		for (const integration of userIntegrations.filter((integration) => integration.type === "steam")) {
			try {
				const newRecentlyPlayed = await this.container.gql.steam
					.getRecentlyPlayed({ steamId64: integration.profile.id })
					.catch(() => null);
				if (!newRecentlyPlayed || newRecentlyPlayed.length === 0)
					throw new Error("Failed to retrieve recently played games");

				const updatedRecentlyPlayed = newRecentlyPlayed.map((newEntry) => {
					const oldEntry = integration.leaderboard.find((oldEntry) => oldEntry.id === newEntry.id);
					const storedWeeklyHours = oldEntry?.weeklyHours ?? 0;
					const weeklyHours = oldEntry ? newEntry.totalHours - oldEntry.totalHours : newEntry.biweeklyHours;

					return { ...newEntry, weeklyHours: storedWeeklyHours + weeklyHours };
				});

				await this.container.db
					.update(integrations)
					.set({ leaderboard: updatedRecentlyPlayed })
					.where(and(eq(integrations.type, "steam"), eq(integrations.userId, integration.userId)));

				const topPlayed = updatedRecentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
				const totalWeeklyHours = Number(updatedRecentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0).toFixed(2));

				const user = await this.container.client.users.fetch(integration.userId);

				leaderboard.push({
					description: `**${user.username}** - **${totalWeeklyHours}h** (Most played: **[${topPlayed.title}](${topPlayed.url})**)`,
					value: totalWeeklyHours,
				});
			} finally {
				await this.container.db
					.update(integrations)
					.set({
						leaderboard: sql`(SELECT jsonb_agg(jsonb_set(entry, '{weeklyHours}', '0'::jsonb, true)) FROM jsonb_array_elements(leaderboard) AS entry)`,
					})
					.where(and(eq(integrations.type, "steam"), eq(integrations.userId, integration.userId)));
			}
		}

		const from = `<t:${toSeconds(Date.now() - 7 * 24 * 60 * 60 * 1000)}:f>`;
		const to = `<t:${toSeconds(Date.now())}:f>`;
		const totalAccumulatedHours = leaderboard.reduce((acc, el) => acc + el.value, 0);
		const motivationalMessage = shuffle([
			"Can you claim the #1 spot next week? Let's find out! 😈",
			"Think you can beat them next week? Keep gaming and prove it! 💪🎮",
			"Will a new challenger appear next week? Keep gaming and let's see! 🚀🎮",
			"Think you can take the crown next week? Keep gaming and let's see who tops the charts! 🚀",
			"Will you claim the throne next week? Keep grinding, and let's see who rises to the top! 💪",
			"Will a new game take over next week? Will YOU be on the leaderboard? Keep gaming and find out! 🎮",
			"Who's ready to take the top spot next week? Keep gaming and see if you can make it to the leaderboard! 🚀",
		])[0];

		return {
			title: `🏆 Weekly Steam Leaderboard 🏆 – Who Played the Most? (${from} - ${to})`,
			leaderboard: leaderboard
				.sort((a, b) => b.value - a.value)
				.slice(0, 3)
				.map((entry, index) => `${Medals[index]} ${entry.description}`),
			extras: [`⏳ Total hours played by the community: **${totalAccumulatedHours}h**`, motivationalMessage],
		};
	}
}
