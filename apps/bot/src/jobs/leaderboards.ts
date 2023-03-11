import { IntegrationCategory, IntegrationsModel, MessageCategory, SettingsModel } from '@luferro/database';
import { XboxApi } from '@luferro/games-api';
import { EnumUtil, logger, SleepUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import * as Leaderboards from '../services/leaderboards';
import type { Bot } from '../structures/bot';
import type { JobData } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Leaderboards,
	schedule: '0 0 0 * * 0',
};

export const execute = async (client: Bot) => {
	const leaderboards = await getLeaderboards(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await SettingsModel.getSettingsByGuildId(guildId);

		for (const category of EnumUtil.enumKeysToArray(IntegrationCategory)) {
			const leaderboard = leaderboards[category];
			if (!leaderboard || leaderboard.length === 0) continue;

			const channelId = settings?.messages[MessageCategory.Leaderboards]?.channelId;
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
	await IntegrationsModel.resetWeeklyHours();

	const integrations = await IntegrationsModel.getIntegrations(IntegrationCategory.Xbox);
	for (const integration of integrations) {
		const { gamerscore } = await XboxApi.getProfile(integration.profile.gamertag);
		await IntegrationsModel.updateGamerscore(integration.userId, gamerscore);
		await SleepUtil.sleep(5000);
	}
};
