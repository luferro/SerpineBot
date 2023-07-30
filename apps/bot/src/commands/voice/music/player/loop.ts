import { logger } from '@luferro/shared-utils';
import { QueueRepeatMode } from 'discord-player';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId, slots }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || queue.isEmpty()) throw new Error('Cannot toggle loop mode.');

	const repeatMode: Record<string, QueueRepeatMode> = {
		OFF: QueueRepeatMode.OFF,
		TRACK: QueueRepeatMode.TRACK,
		QUEUE: QueueRepeatMode.QUEUE,
		AUTOPLAY: QueueRepeatMode.AUTOPLAY,
	};
	queue.setRepeatMode(repeatMode[slots['position']]);

	logger.debug(`Voice command: toggle loop.`);
};
