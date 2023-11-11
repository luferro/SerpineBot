import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { DateUtil, logger, SleepUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../../types/bot';
import * as Leaderboards from '../../../utils/leaderboards';

export const data: JobData = {
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	try {
		const leaderboard = await Leaderboards.getXboxLeaderboard(client);

		const from = DateUtil.format({ date: Date.now() - 7 * 24 * 60 * 60 * 1000 });
		const to = DateUtil.format({ date: Date.now() });

		const embed = new EmbedBuilder()
			.setTitle(t('jobs.gaming.leaderboards.xbox.embed.title', { from, to }))
			.setDescription(leaderboard.join('\n'))
			.setColor('Random');

		await client.propageMessages({ category: 'Leaderboards', embeds: [embed] });
		logger.info(`**Xbox** leaderboard has been generated and sent to all guilds.`);
	} finally {
		const integrations = await IntegrationsModel.getIntegrations<XboxIntegration>({ category: 'Xbox' });
		for (const { userId, profile } of integrations) {
			const { gamerscore } = await client.api.gaming.platforms.xbox.getProfile({ gamertag: profile.gamertag });
			await IntegrationsModel.updateGamerscore({ userId, gamerscore });
			await SleepUtil.sleep(5000);
		}
		logger.info('**Xbox** leaderboard has been reset.');
	}
};
