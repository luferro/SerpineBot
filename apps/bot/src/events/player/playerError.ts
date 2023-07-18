import { logger } from '@luferro/shared-utils';
import { GuildQueue } from 'discord-player';

import { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<unknown>, error: Error];

export const data: EventData = { type: 'on', isPlayer: true };

export const execute: EventExecute<Args> = async ({ rest: [queue, error] }) => {
	logger.warn(`Player error event: ${error.message}.`);
	if (queue.tracks.size > 0) queue.node.skip();
	else queue.delete();
};
