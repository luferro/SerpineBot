import { ExtendedRedisClient } from '@luferro/database';
import { AnimeScheduleApi } from '@luferro/entertainment-api';
import NodeCache from 'node-cache';

export type WeeklyAnimeSchedule = Awaited<ReturnType<InstanceType<typeof AnimeScheduleApi>['getWeeklySchedule']>>;

export type Memory = { anime: NodeCache };
export type Persistent = ExtendedRedisClient;
