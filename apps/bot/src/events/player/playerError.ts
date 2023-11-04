import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, error: Error];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, error] }) => {
	const { metadata } = queue;
	client.emit('clientError', error);
	const embed = new EmbedBuilder().setTitle('Could not stream this track. Skipping it...');
	await metadata.send({ embeds: [embed] });
};
