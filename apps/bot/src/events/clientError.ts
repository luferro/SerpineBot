import { FetchError, logger } from '@luferro/shared-utils';

import type { EventData, EventExecute } from '../types/bot';

type Args = [error: Error];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ rest: [error] }) => {
	if (error instanceof FetchError) {
		const { url, status, payload } = error;
		logger.warn(`Request to ${url} failed.`);
		logger.debug({ url, status, payload });
		return;
	}
	logger.error(error);
};
