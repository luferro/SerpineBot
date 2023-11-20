import type { Bot } from '../structures/Bot';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await client.prisma.steam.findMany();
	for (const integration of integrations) {
		const recentlyPlayed = await client.api.gaming.platforms.steam.getRecentlyPlayed({
			id: integration.profile.id,
		});
		if (recentlyPlayed.length === 0) continue;

		const updatedRecentlyPlayed = recentlyPlayed.map((game) => {
			const storedGame = integration.recentlyPlayed.find((storedGame) => storedGame.id === game.id);
			const storedWeeklyHours = storedGame?.weeklyHours ?? 0;
			const weeklyHours = storedGame ? game.totalHours - storedGame.totalHours : game.biweeklyHours;

			return { ...game, weeklyHours: storedWeeklyHours + weeklyHours };
		});

		await client.prisma.steam.update({
			where: { userId: integration.userId },
			data: { recentlyPlayed: updatedRecentlyPlayed },
		});

		const { title, url } = integration.recentlyPlayed.reduce((acc, el) =>
			el.weeklyHours > acc.weeklyHours ? el : acc,
		);
		const hours = integration.recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0).toFixed(1);

		const user = await client.users.fetch(integration.userId);
		leaderboard.push({ user, topPlayed: { title, url, hours: Number(hours) } });
	}

	return leaderboard
		.sort((a, b) => b.topPlayed.hours - a.topPlayed.hours)
		.slice(0, 10)
		.map(({ user, topPlayed }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.username}** with \`${topPlayed.hours}h\`\nTop played game was **[${topPlayed.title}](${topPlayed.url})**`;
			return `${position} ${description}`;
		});
};

export const getXboxLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await client.prisma.xbox.findMany();
	for (const integration of integrations) {
		const profile = await client.api.gaming.platforms.xbox.getProfile({ gamertag: integration.profile.gamertag });
		if (!profile) continue;

		await client.prisma.xbox.update({
			where: { userId: integration.userId },
			data: { profile: { ...integration.profile, gamerscore: profile.gamerscore } },
		});

		const weeklyGamerscore = profile.gamerscore - integration.profile.gamerscore;

		const user = await client.users.fetch(integration.userId);
		leaderboard.push({ user, gamerscore: weeklyGamerscore });
	}

	return leaderboard
		.sort((a, b) => b.gamerscore - a.gamerscore)
		.slice(0, 10)
		.map(({ user, gamerscore }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.username}** with \`${gamerscore}G\``;
			return `${position} ${description}`;
		});
};
