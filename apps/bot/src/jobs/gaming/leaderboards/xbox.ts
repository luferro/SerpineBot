import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { DateUtil, logger, SleepUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import * as Leaderboards from '../../../services/leaderboards';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = {
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	const leaderboard = await Leaderboards.getXboxLeaderboard(client);

	const fromDate = DateUtil.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const toDate = DateUtil.formatDate(Date.now() - 24 * 60 * 60 * 1000);

	const embed = new EmbedBuilder()
		.setTitle(`Weekly Xbox Leaderboard (${fromDate} - ${toDate})`)
		.setDescription(leaderboard.join('\n'))
		.setColor('Random');

	await client.propageMessages({ category: 'Leaderboards', embeds: [embed] });
	logger.info(`**Xbox** leaderboard has been generated and sent to all guilds.`);

	await resetLeaderboard({ client });
};

const resetLeaderboard = async ({ client }: Parameters<typeof execute>[0]) => {
	const integrations = await IntegrationsModel.getIntegrations<XboxIntegration>({ category: 'Xbox' });
	for (const integration of integrations) {
		const { gamerscore } = await client.api.gaming.xbox.getProfile(integration.profile.gamertag);
		await IntegrationsModel.updateGamerscore({ userId: integration.userId, gamerscore });
		await SleepUtil.sleep(5000);
	}
	logger.info('**Xbox** leaderboard has been reset.');
};
