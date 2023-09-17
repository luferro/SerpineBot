import { IntegrationsModel, SteamIntegration, XboxIntegration } from '@luferro/database';

import type { Bot } from '../Bot';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await IntegrationsModel.getIntegrations<SteamIntegration>({ category: 'Steam' });
	for (const integration of integrations) {
		const data = await client.api.gaming.steam.getRecentlyPlayed({ id: integration.profile.id });
		if (data.length === 0) continue;

		const recentlyPlayed = data.map((game) => {
			const storedItem = integration.recentlyPlayed.find(({ id: storedItemId }) => storedItemId === game.id);
			const storedWeeklyHours = storedItem?.weeklyHours ?? 0;
			const weeklyHours = storedItem ? game.totalHours - storedItem.totalHours : game.twoWeeksHours;

			return { ...game, weeklyHours: storedWeeklyHours + weeklyHours };
		});
		await IntegrationsModel.updateRecentlyPlayed({ userId: integration.userId, recentlyPlayed });

		const user = await client.users.fetch(integration.userId);
		const { name, url } = recentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
		const hours = recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0).toFixed(1);

		leaderboard.push({ user, topPlayed: { name, url, hours: Number(hours) } });
	}

	return leaderboard
		.sort((a, b) => b.topPlayed.hours - a.topPlayed.hours)
		.slice(0, 10)
		.map(({ user, topPlayed }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.username}** with \`${topPlayed.hours}h\`\nTop played game was **[${topPlayed.name}](${topPlayed.url})**`;
			return `${position} ${description}`;
		});
};

export const getXboxLeaderboard = async (client: Bot) => {
	const leaderboard = [];

	const integrations = await IntegrationsModel.getIntegrations<XboxIntegration>({ category: 'Xbox' });
	for (const integration of integrations) {
		const data = await client.api.gaming.xbox.getProfile({ gamertag: integration.profile.gamertag });
		if (!data) continue;

		await IntegrationsModel.updateGamerscore({ userId: integration.userId, gamerscore: data.gamerscore });

		const user = await client.users.fetch(integration.userId);
		const weeklyGamerscore = data.gamerscore - integration.profile.gamerscore;

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
