import type { Bot } from '../structures/Bot';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await client.prisma.steam.findMany();
	for (const { userId, profile, recentlyPlayed } of integrations) {
		const rawRecentlyPlayed = await client.api.gaming.platforms.steam.getRecentlyPlayed({ id: profile.id });
		if (rawRecentlyPlayed.length === 0) continue;

		const updatedRecentlyPlayed = rawRecentlyPlayed.map((game) => {
			const storedGame = recentlyPlayed.find((storedGame) => storedGame.id === game.id);
			const storedWeeklyHours = storedGame?.weeklyHours ?? 0;
			const weeklyHours = storedGame ? game.totalHours - storedGame.totalHours : game.biweeklyHours;

			return { ...game, weeklyHours: storedWeeklyHours + weeklyHours };
		});

		await client.prisma.steam.update({ where: { userId }, data: { recentlyPlayed: updatedRecentlyPlayed } });

		const { title, url } = updatedRecentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
		const hours = +updatedRecentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0).toFixed(2);

		const user = await client.users.fetch(userId);
		leaderboard.push({ user, hours, game: { title, url } });
	}

	return leaderboard
		.sort((a, b) => b.hours - a.hours)
		.slice(0, 10)
		.map(({ user, hours, game }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.username}** with \`${hours}h\`\nTop played game was **[${game.title}](${game.url})**`;
			return `${position} ${description}`;
		});
};

export const getXboxLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await client.prisma.xbox.findMany();
	for (const { userId, profile, recentlyPlayed } of integrations) {
		const rawRecentlyPlayed = await client.api.gaming.platforms.xbox.getRecentlyPlayed({ id: profile.id });
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

		await client.prisma.xbox.update({ where: { userId }, data: { recentlyPlayed: updatedRecentlyPlayed } });

		const { title } = updatedRecentlyPlayed.reduce((acc, el) =>
			el.weeklyGamerscore > acc.weeklyGamerscore ? el : acc,
		);
		const gamerscore = +updatedRecentlyPlayed.reduce((acc, el) => acc + el.weeklyGamerscore, 0).toFixed(2);

		const user = await client.users.fetch(userId);
		leaderboard.push({ user, gamerscore, game: { title } });
	}

	return leaderboard
		.sort((a, b) => b.gamerscore - a.gamerscore)
		.slice(0, 10)
		.map(({ user, gamerscore, game }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.username}** with \`${gamerscore}G\`\nTop gamerscore achieved on **${game.title}**`;
			return `${position} ${description}`;
		});
};
