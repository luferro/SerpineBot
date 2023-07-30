import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || queue.history.isEmpty()) throw new Error('Cannot play previous track.');

	queue.history.previous();

	logger.debug(`Voice command: playing previous track.`);
};
