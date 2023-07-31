import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue, Track } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, track: Track];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, track] }) => {
	const { metadata, currentTrack } = queue;

	const embed = new EmbedBuilder();
	const isTrackPlaying = !currentTrack && queue.tracks.size === 1;
	if (isTrackPlaying) {
		embed
			.setAuthor({
				iconURL: client.user?.avatarURL() ?? client.user?.defaultAvatarURL,
				name: 'Now playing',
			})
			.setTitle(track.title)
			.setURL(track.url)
			.setThumbnail(track.thumbnail)
			.setFields([{ name: '**Duration**', value: `**${track.duration}**` }])
			.setFooter({
				iconURL: track.requestedBy?.avatarURL() ?? track.requestedBy?.defaultAvatarURL,
				text: `Requested by ${track.requestedBy?.username}`,
			})
			.setColor('Random');
	} else {
		embed
			.setAuthor({
				iconURL: track.requestedBy?.avatarURL() ?? track.requestedBy?.defaultAvatarURL,
				name: 'Added track',
			})
			.setTitle(track.title)
			.setURL(track.url)
			.setThumbnail(track.thumbnail)
			.setColor('Random');
	}

	await metadata.send({ embeds: [embed] });
};
