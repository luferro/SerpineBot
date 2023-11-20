import { Redis } from 'ioredis';

export type ExtendedRedisClient = Redis;

export const getExtendedRedisClient = (): ExtendedRedisClient => {
	return process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();
};
