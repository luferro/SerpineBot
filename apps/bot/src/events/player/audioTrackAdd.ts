import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue, Track } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, track: Track];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, track] }) => {
	const { metadata, currentTrack } = queue;

	const userIconUrl = track.requestedBy?.avatarURL() ?? track.requestedBy?.defaultAvatarURL;
	const clientIconUrl = client.user?.avatarURL() ?? client.user?.defaultAvatarURL;

	const embed = new EmbedBuilder()
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.setColor('Random');

	if (!currentTrack && queue.tracks.size === 1) {
		embed
			.setAuthor({ iconURL: clientIconUrl, name: 'Now playing' })
			.setFields([{ name: '**Duration**', value: `**${track.duration}**` }])
			.setFooter({ iconURL: userIconUrl, text: `Requested by ${track.requestedBy?.username}` });
	} else embed.setAuthor({ iconURL: userIconUrl, name: 'Added track' });

	await metadata.send({ embeds: [embed] });
};
