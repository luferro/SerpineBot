import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue, Track } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, track: Track];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ rest: [queue, track] }) => {
	const channel = queue.metadata;

	const embed = new EmbedBuilder()
		.setAuthor({
			iconURL: track.requestedBy?.avatarURL() ?? track.requestedBy?.defaultAvatarURL,
			name: 'Added track',
		})
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.setColor('Random');

	channel.send({ embeds: [embed] });
};
