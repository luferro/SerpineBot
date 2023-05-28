import { Action, Integration, IntegrationsModel } from '@luferro/database';
import { EnumUtil, logger, SleepUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import * as Leaderboards from '../services/leaderboards';
import type { Bot } from '../structures/Bot';
import type { JobData, JobExecute } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Leaderboards,
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	const leaderboards = await getLeaderboards(client);

	for (const { 1: guild } of client.guilds.cache) {
		const message = await client.settings.message().withGuild(guild).get({ category: Action.Leaderboards });
		if (!message) continue;

		for (const category of EnumUtil.enumKeysToArray(Integration)) {
			const leaderboard = leaderboards[category];
			if (!leaderboard || leaderboard.length === 0) continue;

			const { channelId } = message;
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

	await resetLeaderboards(client);
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

const resetLeaderboards = async (client: Bot) => {
	await IntegrationsModel.resetWeeklyHours();

	const integrations = await IntegrationsModel.getIntegrations(Integration.Xbox);
	for (const integration of integrations) {
		const { gamerscore } = await client.api.gaming.xbox.getProfile(integration.profile.gamertag);
		await IntegrationsModel.updateGamerscore(integration.userId, gamerscore);
		await SleepUtil.sleep(5000);
	}
};
