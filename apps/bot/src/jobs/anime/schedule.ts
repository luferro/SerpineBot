import { logger } from '@luferro/shared-utils';

import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 0 * * 1' };

export const execute: JobExecute = async ({ client }) => {
	client.cache.anime.schedule.clear();
	const schedule = await client.api.shows.animeschedule.getWeeklySchedule();
	for (const anime of schedule) {
		const weekDay = new Date(anime.episodes.current.date).getDay();

		const cache = client.cache.anime.schedule.get(weekDay);
		if (!cache) client.cache.anime.schedule.set(weekDay, [anime]);
		else client.cache.anime.schedule.set(weekDay, cache.concat(anime));
	}
	logger.info('Weekly anime schedule has been updated.');
	logger.debug(client.cache.anime.schedule.get(new Date().getDay()));
};
