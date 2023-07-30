import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId, slots }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || queue.isEmpty()) throw new Error('Cannot skip track.');

	const position = Number(slots['position']);
	if (position) queue.node.skipTo(position - 1);
	else queue.node.skip();

	logger.debug(`Voice command: skipped track.`);
};
