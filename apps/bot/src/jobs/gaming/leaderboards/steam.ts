import { Action, IntegrationsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
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
			.setTitle(`Weekly Steam Leaderboard (${fromDate} - ${toDate})`)
			.setDescription(leaderboard.join('\n'))
			.setColor('Random');

		await channel.send({ embeds: [embed] });

		logger.info(`**Steam** leaderboard has been generated and sent to guild **${guild.name}**.`);
	}

	await resetLeaderboard();
};

const resetLeaderboard = async () => {
	await IntegrationsModel.resetWeeklyHours();
	logger.info('**Steam** leaderboard has been reset.');
};
