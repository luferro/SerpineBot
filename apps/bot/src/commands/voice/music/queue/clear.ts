import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue) throw new Error('Cannot clear queue.');

	queue.tracks.clear();

	logger.debug('Voice command: clear queue.');
};
