import { QueryType } from 'discord-player';

import type { VoiceCommandExecute } from '../../../types/bot';

type Args = [userId: string];

export const execute: VoiceCommandExecute<Args> = async ({ client, queue, slots, rest: [userId] }) => {
	const user = client.users.cache.get(userId);

	const query = slots['query'];
	if (!query) throw new Error('No query provided.');

	const channel = queue.channel;
	if (!channel) throw new Error('No voice channel associated with guild queue.');

	await client.player.play(channel, query, { searchEngine: QueryType.AUTO, requestedBy: user });
};
