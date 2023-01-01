import type { JobData } from '../types/bot';
import type { Bot } from '../structures/bot';
import type { IntegrationCategory } from '../types/category';
import { EmbedBuilder } from 'discord.js';
import { logger, SleepUtil } from '@luferro/shared-utils';
import { XboxApi } from '@luferro/games-api';
import * as Leaderboards from '../services/leaderboards';
import { settingsModel } from '../database/models/settings';
import { steamModel } from '../database/models/steam';
import { xboxModel } from '../database/models/xbox';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Leaderboards,
	schedule: '0 0 0 * * 0',
};

export const execute = async (client: Bot) => {
	const categories: IntegrationCategory[] = ['Steam', 'Xbox'];
	const leaderboards = await getLeaderboards(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await settingsModel.findOne({ guildId });

		const channels: Record<IntegrationCategory, string | null> = {
			Steam: settings?.leaderboards.steam.channelId ?? null,
			Xbox: settings?.leaderboards.xbox.channelId ?? null,
		};

		for (const category of categories) {
			const leaderboard = leaderboards[category];
			if (!leaderboard || leaderboard.length === 0) continue;

			const channelId = channels[category];
			if (!channelId) continue;

			const channel = await client.channels.fetch(channelId);
			if (!channel?.isTextBased()) continue;

			const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT');
			const toDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT');

			const embed = new EmbedBuilder()
				.setTitle(`Weekly ${category} Leaderboard (${fromDate} - ${toDate})`)
				.setDescription(leaderboard.join('\n'))
				.setColor('Random');

			await channel.send({ embeds: [embed] });

			logger.info(`Leaderboards job sent a message to channel **${channelId}** in guild **${guild.name}**.`);
		}
	}

	await resetLeaderboards();
};

const getLeaderboards = async (client: Bot) => {
	const promises = await Promise.allSettled([
		Leaderboards.getSteamLeaderboard(client),
		Leaderboards.getXboxLeaderboard(client),
	]);

	const getResult = <T>(promise: PromiseSettledResult<T>) => (promise.status === 'fulfilled' ? promise.value : null);

	return {
		Steam: getResult(promises[0]),
		Xbox: getResult(promises[1]),
	};
};

const resetLeaderboards = async () => {
	await steamModel.updateMany({}, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });

	const integrations = await xboxModel.find();
	for (const integration of integrations) {
		const { gamerscore } = await XboxApi.getProfile(integration.profile.gamertag);
		await xboxModel.updateOne({ userId: integration.userId }, { $set: { 'profile.gamerscore': gamerscore } });
		await SleepUtil.sleep(5000);
	}
};
