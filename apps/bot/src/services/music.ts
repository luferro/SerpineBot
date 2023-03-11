import { ConverterUtil } from '@luferro/shared-utils';
import type { GuildMember, User, VoiceBasedChannel } from 'discord.js';
import { QueryType, QueueRepeatMode, Track } from 'discord-player';

import type { Bot } from '../structures/bot';

const getQueue = (client: Bot, guildId: string) => {
	const queue = client.player.nodes.get(guildId);

	if (!queue) throw new Error("I'm not connected to a voice channel.");
	return queue;
};

export const isConnectedToVoiceChannel = (client: Bot, guildId: string) => {
	try {
		getQueue(client, guildId);
		return true;
	} catch (error) {
		return false;
	}
};

export const search = async (client: Bot, query: string, requestedBy: User, limit?: number) => {
	const data = await client.player.search(query, {
		requestedBy,
		searchEngine: QueryType.AUTO,
	});
	if (!data || !data.tracks.length) throw new Error(`No matches for ${query}.`);

	const isLivestream = (duration: string) => /0?0:00/.test(duration);
	const filteredTracks = data.tracks.filter(({ duration }) => !isLivestream(duration));

	return {
		playlist: data.playlist,
		tracks: limit ? filteredTracks.slice(0, limit) : filteredTracks,
	};
};

export const join = async (client: Bot, guildId: string, member: GuildMember) => {
	if (isConnectedToVoiceChannel(client, guildId)) throw new Error("I'm already connected to a voice channel.");

	const queue = client.player.nodes.create(guildId, { leaveOnEmptyCooldown: 1000 * 60 * 5 });
	await queue.connect(member.voice.channel as VoiceBasedChannel);
};

export const leave = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.delete();
};

export const addTrackToQueue = async (client: Bot, guildId: string, track: Track) => {
	const queue = getQueue(client, guildId);
	queue.addTrack(track);
	if (!queue.node.isPlaying()) await queue.node.play();

	return {
		trackPosition: queue.tracks.size,
	};
};

export const addPlaylistToQueue = async (client: Bot, guildId: string, playlist: Track[]) => {
	const queue = getQueue(client, guildId);
	queue.addTrack(playlist);
	if (!queue.node.isPlaying()) await queue.node.play();

	return {
		playlistPositionStart: queue.node.getTrackPosition(playlist[0]) + 1,
		playlistPositionEnd: queue.node.getTrackPosition(playlist[playlist.length - 1]) + 1,
	};
};

export const removeFromQueue = (client: Bot, guildId: string, position: number) => {
	const queue = getQueue(client, guildId);
	queue.node.remove(position);
};

export const clearQueue = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.tracks.clear();
};

export const seek = async (client: Bot, guildId: string, timestamp: string) => {
	const isValidTimestamp = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(timestamp);
	if (!isValidTimestamp) throw new Error('Invalid timestamp format.');

	const getMilliseconds = (timestampToConvert: string) => {
		let totalMilliseconds = 0;
		timestampToConvert
			.split(':')
			.reverse()
			.forEach((time, index) => {
				if (index === 0) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Seconds');
				if (index === 1) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Minutes');
				if (index === 2) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Hours');
			});

		return totalMilliseconds;
	};

	const queue = getQueue(client, guildId);
	const duration = queue.currentTrack?.duration;
	if (!duration) throw new Error('Could not fetch current track duration.');

	const seekMilliseconds = getMilliseconds(timestamp);
	const durationMilliseconds = getMilliseconds(duration);

	const isSeekValid = seekMilliseconds > 0 && seekMilliseconds < durationMilliseconds;
	if (!isSeekValid) throw new Error(`Seeking beyond limit. [0 - ${duration}]`);

	await queue.node.seek(seekMilliseconds);
};

export const loop = (client: Bot, guildId: string, mode: QueueRepeatMode) => {
	const queue = getQueue(client, guildId);
	queue.setRepeatMode(mode);
};

export const skip = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	const isSkipSuccessful = queue.node.skip();
	if (!isSkipSuccessful || queue.tracks.size === 0) throw new Error('Cannot skip track.');
	return { skippedTrack: queue.currentTrack as Track, currentTrack: queue.tracks.at(0) as Track };
};

export const pause = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.node.setPaused(true);
	return { pausedTrack: queue.currentTrack as Track };
};

export const resume = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.node.setPaused(false);
	return { resumedTrack: queue.currentTrack as Track };
};

export const volume = (client: Bot, guildId: string, volume: number) => {
	const queue = getQueue(client, guildId);
	if (volume < 0 || volume > 100) throw new Error('Volume must be between 0 and 100.');
	queue.node.setVolume(volume);
};

export const toggleBassBoost = async (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	await queue.filters.ffmpeg.toggle('bassboost');
};

export const queue = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	return { currentTrack: queue.currentTrack as Track, queue: queue.tracks };
};

export const shuffle = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.tracks.shuffle();
};
