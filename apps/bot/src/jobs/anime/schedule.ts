import { logger } from '@luferro/shared-utils';
import { Collection } from 'discord.js';

import { JobData, JobExecute } from '../../types/bot';
import { WeeklyAnimeSchedule } from '../../types/cache';

export const data: JobData = { schedule: '0 0 0 * * 1' };

export const execute: JobExecute = async ({ client }) => {
	client.cache.memory.anime.flushAll();

	const schedule = new Collection<number, WeeklyAnimeSchedule>();
	for (const anime of await client.api.anime.getWeeklySchedule()) {
		const weekDay = new Date(anime.episodes.current.date).getDay();
		const entries = schedule.get(weekDay);
		if (!entries) schedule.set(weekDay, [anime]);
		else schedule.set(weekDay, entries.concat(anime));
	}

	client.cache.memory.anime.mset(Array.from(schedule).map(([key, val]) => ({ key, val })));
	logger.info('Weekly anime schedule has been updated.');
	logger.debug(client.cache.memory.anime.get<WeeklyAnimeSchedule>(new Date().getDay()));
};
