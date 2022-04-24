import { Client } from 'discord.js';
import { Bot } from '../bot';
import * as Steam from '../apis/steam';
import { steamModel } from '../database/models/steam';

enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export const getSteamLeaderboard = async (client: Bot | Client) => {
	const leaderboard = [];

	const integrations = await steamModel.find();
	for (const integration of integrations) {
		const data = await Steam.getRecentlyPlayed(integration.profile.id);
		if (!data) continue;

		const recentlyPlayed = data.map((game) => {
			const storedItem = integration.recentlyPlayed.find(
				({ id: nestedStoredItemId }) => nestedStoredItemId === game.id,
			);
			const storedWeeklyHours = storedItem?.weeklyHours ?? 0;

			return {
				...game,
				weeklyHours: storedWeeklyHours + game.weeklyHours,
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
