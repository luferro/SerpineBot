import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || queue.isEmpty()) throw new Error('Cannot shuffle queue.');

	queue.tracks.shuffle();

	logger.debug(`Voice command: shuffle queue.`);
};
