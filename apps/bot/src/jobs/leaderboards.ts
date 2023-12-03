import { WebhookType } from '@luferro/database';
import { DateUtil, logger, ObjectUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import { getLeaderboard, LeaderboardType, resetLeaderboard } from '../helpers/leaderboards';
import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 0 0 * * 0' };

export const execute: JobExecute = async ({ client }) => {
	for (const type of ObjectUtil.enumToArray(LeaderboardType)) {
		try {
			const leaderboard = await getLeaderboard(LeaderboardType[type], client);
			if (leaderboard.length === 0) continue;

			const from = DateUtil.format(Date.now() - 7 * 24 * 60 * 60 * 1000);
			const to = DateUtil.format(Date.now());

			const formattedLeaderboard = leaderboard.map(({ position, medal, user, highlight, item }) =>
				t('jobs.leaderboards.embed.description', {
					position: medal ?? `\`${position}.\``,
					username: user.username,
					highlight: highlight.formatted,
					item: item.url ? `[${item.title}](${item.url})` : item.title,
				}),
			);

			await client.propagate({
				type: WebhookType.LEADERBOARDS,
				cache: false,
				fields: ['title', 'description'],
				messages: [
					new EmbedBuilder()
						.setTitle(t('jobs.leaderboards.embed.title', { from, to }))
						.setDescription(formattedLeaderboard.join('\n'))
						.setColor('Random'),
				],
			});
			logger.info(`**${LeaderboardType[type]}** leaderboard has been generated and sent to valid guilds.`);
		} finally {
			await resetLeaderboard(LeaderboardType[type], client);
			logger.info(`**${LeaderboardType[type]}** leaderboard has been reset.`);
		}
	}
};
