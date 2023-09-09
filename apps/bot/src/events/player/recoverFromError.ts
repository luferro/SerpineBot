import { TextBasedChannel } from 'discord.js';
import { GuildQueue } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client }) => {
	for (const [guildId] of client.guilds.cache) {
		const queue = client.player.nodes.get(guildId);
		if (!queue) continue;

		queue.revive();
		if (queue.currentTrack || !queue.isEmpty()) await queue.node.play();
	}
};
