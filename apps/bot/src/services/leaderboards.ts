import type { Client } from 'discord.js';
import type { Bot } from '../structures/bot';
import { SteamApi, XboxApi } from '@luferro/games-api';
import { steamModel } from '../database/models/steam';
import { xboxModel } from '../database/models/xbox';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot | Client) => {
	const leaderboard = [];

	const integrations = await steamModel.find();
	for (const integration of integrations) {
		const data = await SteamApi.getRecentlyPlayed(integration.profile.id);
		if (data.length === 0) continue;

		const recentlyPlayed = data.map((game) => {
			const storedItem = integration.recentlyPlayed.find(({ id: storedItemId }) => storedItemId === game.id);
			const storedWeeklyHours = storedItem?.weeklyHours ?? 0;

			const weeklyHours = storedItem ? game.totalHours - storedItem.totalHours : game.twoWeeksHours;

			return {
				...game,
				weeklyHours: storedWeeklyHours + weeklyHours,
			};
		});
		await steamModel.updateOne({ userId: integration.userId }, { $set: { recentlyPlayed } });

		const { name, url } = recentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
		const hours = recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0);

		const user = await client.users.fetch(integration.userId);

		leaderboard.push({
			user,
			topPlayed: {
				name,
				url,
				hours: Number(hours.toFixed(1)),
			},
		});
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

	const integrations = await xboxModel.find();
	for (const integration of integrations) {
		const data = await XboxApi.getProfile(integration.profile.gamertag);
		if (!data) continue;

		const weeklyGamerscore = data.gamerscore - integration.profile.gamerscore;

		await steamModel.updateOne({ userId: integration.userId }, { $set: { 'profile.gamerscore': data.gamerscore } });

		const user = await client.users.fetch(integration.userId);

		leaderboard.push({
			user,
			gamerscore: weeklyGamerscore,
		});
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
