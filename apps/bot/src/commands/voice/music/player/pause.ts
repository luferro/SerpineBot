import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || !queue.currentTrack) throw new Error('Cannot pause playback.');

	queue.node.pause();

	logger.debug(`Voice command: pause ${queue.currentTrack.title}`);
};
