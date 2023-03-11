import { IntegrationCategory, IntegrationsModel } from '@luferro/database';
import { SteamApi, XboxApi } from '@luferro/games-api';
import type { Client } from 'discord.js';

import type { Bot } from '../structures/bot';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot | Client) => {
	const leaderboard = [];

	const integrations = await IntegrationsModel.getIntegrations(IntegrationCategory.Steam);
	for (const integration of integrations) {
		const data = await SteamApi.getRecentlyPlayed(integration.profile.id);
		if (data.length === 0) continue;

		const recentlyPlayed = data.map((game) => {
			const storedItem = integration.recentlyPlayed.find(({ id: storedItemId }) => storedItemId === game.id);
			const storedWeeklyHours = storedItem?.weeklyHours ?? 0;
			const weeklyHours = storedItem ? game.totalHours - storedItem.totalHours : game.twoWeeksHours;

			return { ...game, weeklyHours: storedWeeklyHours + weeklyHours };
		});
		await IntegrationsModel.updateRecentlyPlayed(integration.userId, recentlyPlayed);

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
			const description = `**${user.tag}** with \`${topPlayed.hours}h\`\nTop played game was **[${topPlayed.name}](${topPlayed.url})**`;

			return `${position} ${description}`;
		});
};

export const getXboxLeaderboard = async (client: Bot | Client) => {
	const leaderboard = [];

	const integrations = await IntegrationsModel.getIntegrations(IntegrationCategory.Xbox);
	for (const integration of integrations) {
		const data = await XboxApi.getProfile(integration.profile.gamertag);
		if (!data) continue;

		await IntegrationsModel.updateGamerscore(integration.userId, data.gamerscore);

		const user = await client.users.fetch(integration.userId);
		const weeklyGamerscore = data.gamerscore - integration.profile.gamerscore;

		leaderboard.push({ user, gamerscore: weeklyGamerscore });
	}

	return leaderboard
		.sort((a, b) => b.gamerscore - a.gamerscore)
		.slice(0, 10)
		.map(({ user, gamerscore }, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${user.tag}** with \`${gamerscore}G\``;

			return `${position} ${description}`;
		});
};
