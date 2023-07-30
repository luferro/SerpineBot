import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId, slots }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue) throw new Error('Cannot jump to track.');

	const position = Number(slots['position']!);
	queue.node.jump(position - 1);

	logger.debug(`Voice command: jump to position ${position}.`);
};
