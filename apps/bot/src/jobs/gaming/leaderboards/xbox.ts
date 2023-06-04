import { Action, Integration, IntegrationsModel } from '@luferro/database';
import { logger, SleepUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import * as Leaderboards from '../../../services/leaderboards';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = {
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	const leaderboard = await Leaderboards.getSteamLeaderboard(client);

	for (const { 1: guild } of client.guilds.cache) {
		const message = await client.settings.message().withGuild(guild).get({ category: Action.Leaderboards });
		if (!message?.channelId || !leaderboard || leaderboard.length === 0) continue;

		const channel = await client.channels.fetch(message.channelId);
		if (!channel?.isTextBased()) continue;

		const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT');
		const toDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT');

		const embed = new EmbedBuilder()
			.setTitle(`Weekly Xbox Leaderboard (${fromDate} - ${toDate})`)
			.setDescription(leaderboard.join('\n'))
			.setColor('Random');

		await channel.send({ embeds: [embed] });

		logger.info(`**Xbox** leaderboard has been generated and sent to guild **${guild.name}**.`);
	}

	await resetLeaderboard({ client });
};

const resetLeaderboard = async ({ client }: Parameters<typeof execute>[0]) => {
	const integrations = await IntegrationsModel.getIntegrations(Integration.Xbox);
	for (const integration of integrations) {
		const { gamerscore } = await client.api.gaming.xbox.getProfile(integration.profile.gamertag);
		await IntegrationsModel.updateGamerscore(integration.userId, gamerscore);
		await SleepUtil.sleep(5000);
	}
	logger.info('**Xbox** leaderboard has been reset.');
};
