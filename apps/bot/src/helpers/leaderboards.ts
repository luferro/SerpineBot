import type { Guild } from "discord.js";
import { t } from "i18next";
import type { Bot } from "~/structures/Bot.js";

export enum LeaderboardType {
	STEAM = "Steam",
	XBOX = "Xbox",
}

enum Medal {
	"🥇" = 1,
	"🥈" = 2,
	"🥉" = 3,
}

type LeaderboardOptions = { type: LeaderboardType; client: Bot; guild: Guild };

export const getLeaderboard = async ({ type, ...rest }: LeaderboardOptions) => {
	const leaderboards = {
		[LeaderboardType.STEAM]: getSteamLeaderboard,
		[LeaderboardType.XBOX]: getXboxLeaderboard,
	};
	const leaderboard = await leaderboards[type](rest);
	return leaderboard
		.slice(0, 3)
		.map(({ user, highlight, item }, index) => ({ medal: Medal[index + 1], user, highlight, item }));
};

export const resetLeaderboard = async ({ type, ...rest }: LeaderboardOptions) => {
	const leaderboards = {
		[LeaderboardType.STEAM]: resetSteamLeaderboard,
		[LeaderboardType.XBOX]: resetXboxLeaderboard,
	};
	await leaderboards[type](rest);
};

const getSteamLeaderboard = async ({ client, guild }: Omit<LeaderboardOptions, "type">) => {
	const leaderboard = [];
	const integrations = await client.db.steam.findMany();
	for (const { userId, profile, recentlyPlayed } of integrations) {
		const target = await guild.members.fetch(userId).catch(() => null);
		if (!target) continue;

		const rawRecentlyPlayed = await client.api.gaming.platforms.steam.getRecentlyPlayed(profile.id);
		if (rawRecentlyPlayed.length === 0) continue;

		const updatedRecentlyPlayed = rawRecentlyPlayed.map((game) => {
			const storedGame = recentlyPlayed.find((storedGame) => storedGame.id === game.id);
			const storedWeeklyHours = storedGame?.weeklyHours ?? 0;
			const weeklyHours = storedGame ? game.totalHours - storedGame.totalHours : game.biweeklyHours;

			return { ...game, weeklyHours: storedWeeklyHours + weeklyHours };
		});

		await client.db.steam.update({ where: { userId }, data: { recentlyPlayed: updatedRecentlyPlayed } });

		const { title, url } = updatedRecentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
		const hours = +updatedRecentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0).toFixed(2);

		leaderboard.push({
			user: target.user,
			highlight: { value: hours, formatted: t("common.time.hours", { hours }) },
			item: { title, url },
		});
	}

	return leaderboard.sort((a, b) => b.highlight.value - a.highlight.value);
};

const resetSteamLeaderboard = async ({ client, guild }: Omit<LeaderboardOptions, "type">) => {
	const integrations = await client.db.steam.findMany();
	for (const { userId, recentlyPlayed } of integrations) {
		const target = await guild.members.fetch(userId).catch(() => null);
		if (!target) continue;

		await client.db.steam.update({
			where: { userId },
			data: { recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })) },
		});
	}
};

const getXboxLeaderboard = async ({ client, guild }: Omit<LeaderboardOptions, "type">) => {
	const leaderboard = [];
	const integrations = await client.db.xbox.findMany();
	for (const { userId, profile, recentlyPlayed } of integrations) {
		const target = await guild.members.fetch(userId).catch(() => null);
		if (!target) continue;

		const rawRecentlyPlayed = await client.api.gaming.platforms.xbox.getRecentlyPlayed(profile.id);
		if (rawRecentlyPlayed.length === 0) continue;

		const updatedRecentlyPlayed = rawRecentlyPlayed.map(({ id, title, gamerscore }) => {
			const storedGame = recentlyPlayed.find((storedGame) => storedGame.id === id);
			const storedWeeklyGamerscore = storedGame?.weeklyGamerscore ?? 0;
			const weeklyGamerscore = storedGame ? gamerscore.total - storedGame.totalGamerscore : gamerscore.current;

			return {
				id,
				title,
				currentGamerscore: gamerscore.current,
				totalGamerscore: gamerscore.total,
				weeklyGamerscore: storedWeeklyGamerscore + weeklyGamerscore,
			};
		});

		await client.db.xbox.update({ where: { userId }, data: { recentlyPlayed: updatedRecentlyPlayed } });

		const { title } = updatedRecentlyPlayed.reduce((acc, el) =>
			el.weeklyGamerscore > acc.weeklyGamerscore ? el : acc,
		);
		const gamerscore = +updatedRecentlyPlayed.reduce((acc, el) => acc + el.weeklyGamerscore, 0).toFixed(2);

		leaderboard.push({
			user: target.user,
			highlight: { value: gamerscore, formatted: `${gamerscore}G` },
			item: { title, url: null },
		});
	}

	return leaderboard.sort((a, b) => b.highlight.value - a.highlight.value);
};

const resetXboxLeaderboard = async ({ client, guild }: Omit<LeaderboardOptions, "type">) => {
	const integrations = await client.db.xbox.findMany();
	for (const { userId, recentlyPlayed } of integrations) {
		const target = await guild.members.fetch(userId).catch(() => null);
		if (!target) continue;

		await client.db.xbox.update({
			where: { userId },
			data: { recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyGamerscore: 0 })) },
		});
	}
};
