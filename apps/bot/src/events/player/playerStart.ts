import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { GuildQueue, Track } from 'discord-player';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [queue: GuildQueue<TextBasedChannel>, track: Track];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, track] }) => {
	const { metadata, history } = queue;
	const { previousTrack } = history;

	for (const message of [...metadata.messages.cache.values()]) {
		if (message.author.id !== client.user?.id || message.embeds[0]?.author?.name !== 'Started playing') continue;
		await message.delete();
	}

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: client.user?.avatarURL() ?? client.user?.defaultAvatarURL, name: 'Started playing' })
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.addFields([{ name: '**Duration**', value: track.duration }])
		.setColor('Random');
	if (previousTrack) {
		embed.addFields([{ name: '**Previous track**', value: `[${previousTrack.title}](${previousTrack.url})` }]);
	}

	metadata.send({ embeds: [embed] });
};
