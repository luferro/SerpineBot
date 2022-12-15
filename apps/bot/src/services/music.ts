import type { Bot } from '../structures/bot';
import type { GuildMember, User, VoiceBasedChannel } from 'discord.js';
import { QueryType, QueueRepeatMode, Track } from 'discord-player';
import { ConverterUtil, logger } from '@luferro/shared-utils';

const getQueue = (client: Bot, guildId: string) => {
	const queue = client.player.getQueue(guildId);

	client.player.on('error', (_queue, error) => logger.error(error));
	client.player.on('debug', (_queue, message) => logger.debug(message));

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

	const queue = client.player.createQueue(guildId, {
		leaveOnEmptyCooldown: 1000 * 60 * 5,
		ytdlOptions: { filter: 'audioonly' },
	});
	await queue.connect(member.voice.channel as VoiceBasedChannel);
};

export const leave = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.destroy(true);
};

export const addTrackToQueue = async (client: Bot, guildId: string, track: Track) => {
	const queue = getQueue(client, guildId);
	queue.addTrack(track);
	if (!queue.playing) await queue.play();

	return {
		trackPosition: queue.tracks.length,
	};
};

export const addPlaylistToQueue = async (client: Bot, guildId: string, playlist: Track[]) => {
	const queue = getQueue(client, guildId);
	queue.addTracks(playlist);
	if (!queue.playing) await queue.play();

	return {
		playlistPositionStart: queue.tracks.length,
		playlistPositionEnd: queue.tracks.length + playlist.length,
	};
};

export const removeFromQueue = (client: Bot, guildId: string, position: number) => {
	const queue = getQueue(client, guildId);
	queue.remove(position);
};

export const clearQueue = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.clear();
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
	const { duration } = queue.current;

	const seekMilliseconds = getMilliseconds(timestamp);
	const durationMilliseconds = getMilliseconds(duration);

	const isSeekValid = seekMilliseconds > 0 && seekMilliseconds < durationMilliseconds;
	if (!isSeekValid) throw new Error(`Seeking beyond limit. [0 - ${duration}]`);

	await queue.seek(seekMilliseconds);
};

export const loop = (client: Bot, guildId: string, mode: QueueRepeatMode) => {
	const queue = getQueue(client, guildId);
	queue.setRepeatMode(mode);
};

export const skip = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	const isSkipSuccessful = queue.skip();
	if (!isSkipSuccessful) throw new Error('Cannot skip.');

	return {
		skippedTrack: queue.current,
		currentTrack: queue.tracks[1],
	};
};

export const pause = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.setPaused(true);

	return {
		pausedTrack: queue.current,
	};
};

export const resume = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.setPaused(false);

	return {
		resumedTrack: queue.current,
	};
};

export const volume = (client: Bot, guildId: string, volume: number) => {
	const queue = getQueue(client, guildId);

	if (volume < 0 || volume > 100) throw new Error('Volume must be between 0 and 100.');

	queue.setVolume(volume);
};

export const enableBassBoost = async (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	await queue.setFilters({
		bassboost: !queue.getFiltersEnabled().includes('bassboost'),
		normalizer2: !queue.getFiltersEnabled().includes('bassboost'),
	});
};

export const queue = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);

	return {
		currentTrack: queue.current,
		queue: queue.tracks,
	};
};

export const shuffle = (client: Bot, guildId: string) => {
	const queue = getQueue(client, guildId);
	queue.shuffle();
};
