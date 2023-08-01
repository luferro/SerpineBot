import { QueryType } from 'discord-player';

import type { VoiceCommandExecute } from '../../../types/bot';

type Args = [userId: string];

export const execute: VoiceCommandExecute<Args> = async ({ client, queue, slots, rest: [userId] }) => {
	const user = client.users.cache.get(userId);

	const query = slots['query'];
	if (!query) throw new Error('No query provided.');

	const result = await client.player.search(query, { searchEngine: QueryType.AUTO, requestedBy: user });
	if (result.isEmpty()) throw new Error(`No results for \`${query}\``);

	await queue.node.play(result.tracks[0]);
};
