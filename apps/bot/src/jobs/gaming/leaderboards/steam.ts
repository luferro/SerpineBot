import { IntegrationsModel } from '@luferro/database';
import { DateUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';
import * as Leaderboards from '../../../utils/leaderboards';

export const data: JobData = {
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	try {
		const leaderboard = await Leaderboards.getSteamLeaderboard(client);

		const fromDate = DateUtil.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const toDate = DateUtil.formatDate(Date.now());

		const embed = new EmbedBuilder()
			.setTitle(`Weekly Steam Leaderboard (${fromDate} - ${toDate})`)
			.setDescription(leaderboard.join('\n'))
			.setColor('Random');

		await client.propageMessages({ category: 'Leaderboards', embeds: [embed] });
		logger.info(`**Steam** leaderboard has been generated and sent to all guilds.`);
	} finally {
		await IntegrationsModel.resetWeeklyHours();
		logger.info('**Steam** leaderboard has been reset.');
	}
};
