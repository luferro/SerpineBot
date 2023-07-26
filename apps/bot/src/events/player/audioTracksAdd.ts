import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue, Track } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, tracks: Track[]];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ rest: [queue, tracks] }) => {
	const channel = queue.metadata;
	const { playlist, requestedBy } = tracks[0];
	if (!playlist) return;

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: requestedBy?.avatarURL() ?? requestedBy?.defaultAvatarURL, name: 'Added playlist' })
		.setTitle(playlist.title)
		.setURL(playlist.url)
		.setThumbnail(playlist.thumbnail)
		.addFields([{ name: '**Tracks**', value: playlist.tracks.length.toString() }])
		.setColor('Random');

	channel.send({ embeds: [embed] });
};
