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

		const recentlyPlayed = data.map((item) => {
			const storedEntry = integration.recentlyPlayed.find((nestedItem) => nestedItem.id === item.id);
			const storedWeeklyHours = storedEntry?.weeklyHours ?? 0;

			return {
				...item,
				weeklyHours: storedWeeklyHours + item.weeklyHours,
			};
		});
		await steamModel.updateOne({ userId: integration.userId }, { $set: { recentlyPlayed } });

		const { name, url } = recentlyPlayed.reduce((acc, el) => (el.weeklyHours > acc.weeklyHours ? el : acc));
		const hours = recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0);

		const user = await client.users.fetch(integration.userId);

		leaderboard.push({
			tag: user.tag,
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
		.map((item, index) => {
			const position = Medals[index + 1] ?? `\`${index + 1}.\``;
			const description = `**${item.tag}** with \`${item.topPlayed.hours}h\`\nTop played game was **[${item.topPlayed.name}](${item.topPlayed.url})**`;

			return `${position} ${description}`;
		});
};
