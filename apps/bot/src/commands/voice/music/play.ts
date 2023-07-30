import { logger } from '@luferro/shared-utils';
import { TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { QueryType } from 'discord-player';

import type { VoiceCommandExecute } from '../../../types/bot';

type Args = [userId: string, voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel];

export const execute: VoiceCommandExecute<Args> = async ({
	client,
	slots,
	rest: [userId, voiceChannel, textChannel],
}) => {
	const user = client.users.cache.get(userId);

	const query = slots['query'];
	const { track } = await client.player.play(voiceChannel, query, {
		requestedBy: user,
		searchEngine: QueryType.AUTO,
		nodeOptions: { metadata: textChannel, ...client.connection.config },
	});

	logger.debug(`Voice command: added ${track.title}`);
};
