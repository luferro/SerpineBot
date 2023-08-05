import { logger } from '@luferro/shared-utils';
import { Collection } from 'discord.js';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 0 * * 1' };

export const execute: JobExecute = async ({ client }) => {
	client.cache.anime.schedule.clear();

	const schedule: typeof client.cache.anime.schedule = new Collection();
	for (const anime of await client.api.anime.schedule.getWeeklySchedule()) {
		const weekDay = new Date(anime.episodes.current.date).getDay();

		const cache = schedule.get(weekDay);
		if (!cache) schedule.set(weekDay, [anime]);
		else schedule.set(weekDay, cache.concat(anime));
	}

	client.cache.anime.schedule = schedule;
	logger.info('Weekly anime schedule has been updated.');
	logger.debug(client.cache.anime.schedule.get(new Date().getDay()));
};
