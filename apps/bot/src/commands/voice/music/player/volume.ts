import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId, slots }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue) throw new Error('Cannot change volume.');

	const volume = Number(slots['percentage'].match(/\d+/g)?.[0] ?? queue.node.volume);
	queue.node.setVolume(volume);

	logger.debug(`Voice command: set volume to ${volume}.`);
};
