import { PrismaClient } from '@prisma/client';

import { Extension } from './extensions';

export type ExtendedPrismaClient = ReturnType<typeof getExtendedPrismaClient>;

export const getExtendedPrismaClient = () => {
	return new PrismaClient().$extends(Extension.all).$extends(Extension.subscription);
};
