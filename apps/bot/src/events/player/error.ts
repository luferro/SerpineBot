import { logger } from '@luferro/shared-utils';
import { GuildQueue } from 'discord-player';

import { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<unknown>, error: Error];

export const data: EventData = { type: 'on', isPlayer: true };

export const execute: EventExecute<Args> = async ({ rest: [, error] }) => {
	logger.warn(`General player error event: ${error.message}.`);
};
