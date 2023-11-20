import { WebhookType } from '@luferro/database';
import { DateUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import * as Leaderboards from '../../../helpers/leaderboards';
import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = {
	schedule: '0 0 0 * * 0',
};

export const execute: JobExecute = async ({ client }) => {
	try {
		const leaderboard = await Leaderboards.getXboxLeaderboard(client);

		const from = DateUtil.format(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const to = DateUtil.format(Date.now());

		const embed = new EmbedBuilder()
			.setTitle(t('jobs.gaming.leaderboards.xbox.embed.title', { from, to }))
			.setDescription(leaderboard.join('\n'))
			.setColor('Random');

		await client.propagate({ type: WebhookType.LEADERBOARDS, cache: false, messages: [embed] });
		logger.info(`**Xbox** leaderboard has been generated and sent to all guilds.`);
	} finally {
		const integrations = await client.prisma.xbox.findMany();
		for (const { userId, profile } of integrations) {
			const { gamerscore } = await client.api.gaming.platforms.xbox.getProfile({ gamertag: profile.gamertag });
			await client.prisma.xbox.update({
				where: { userId },
				data: { profile: { ...profile, gamerscore } },
			});
		}
		logger.info('**Xbox** leaderboard has been reset.');
	}
};
