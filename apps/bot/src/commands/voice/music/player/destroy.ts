import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue) throw new Error('Cannot destroy queue.');

	queue.delete();

	logger.debug(`Voice command: destroy queue.`);
};
