import {
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	joinVoiceChannel,
} from '@discordjs/voice';
import { GuildMember, VoiceBasedChannel } from 'discord.js';
import * as ytdl from 'play-dl';
import { Bot } from '../bot';
import * as ConverterUtil from '../utils/converter';
import * as Sleep from '../utils/sleep';
import { QueueItem } from '../types/bot';

const playerOnIdle = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;

	musicSubscription.player.stop();
	musicSubscription.playing = false;

	if (!musicSubscription.looping) musicSubscription.queue.shift();

	if (musicSubscription.queue.length > 0) {
		await Sleep.timeout(500);
		return await play(guildId);
	}

	await Sleep.timeout(1000 * 60 * 10);
	leave(guildId);
};

const play = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;

	const { stream, type } = await ytdl.stream(musicSubscription.queue[0].url);
	musicSubscription.resource = createAudioResource(stream, { inputType: type });

	musicSubscription.playing = true;
	musicSubscription.player.play(musicSubscription.resource);
};

export const join = (guildId: string, member: GuildMember) => {
	const voiceChannel = member.voice.channel as VoiceBasedChannel;

	const subscription = {
		player: createAudioPlayer(),
		resource: null,
		connection: joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
		}),
		playing: false,
		looping: false,
		queue: [] as QueueItem[],
	};

	subscription.connection.subscribe(subscription.player);
	subscription.player.on(AudioPlayerStatus.Idle, async () => await playerOnIdle(guildId));
	Bot.music.set(guildId, subscription);
};

export const leave = (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;

	musicSubscription.player.stop();
	musicSubscription.connection.destroy();
	Bot.music.delete(guildId);
};

export const addToQueue = async (guildId: string, queueItem: QueueItem) => {
	const musicSubscription = Bot.music.get(guildId)!;

	if (musicSubscription.queue.length === 0) {
		musicSubscription.playing = true;
		musicSubscription.queue = [queueItem];

		await play(guildId);
	} else {
		const hasEntry = musicSubscription.queue.some((item) => JSON.stringify(item) === JSON.stringify(queueItem));
		if (hasEntry) throw new Error('Entry already exists in the queue.');

		musicSubscription.queue.push(queueItem);
	}

	return {
		position: musicSubscription.queue.findIndex((item) => JSON.stringify(item) === JSON.stringify(queueItem)),
	};
};

export const removeFromQueue = async (guildId: string, position: number) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length === 0) throw new Error('Queue is empty.');
	if (position < 1 || position > musicSubscription.queue.length) throw new Error('Invalid queue position.');

	musicSubscription.queue.splice(position, 1);
};

export const clearQueue = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length <= 1) throw new Error('Queue is already empty.');

	musicSubscription.queue.length = 1;
};

export const seek = async (guildId: string, time: string) => {
	if (!/([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(time))
		throw new Error('Invalid time format. Use the following format hh?:mm:ss where ? is optional.');

	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

	const getMilliseconds = (timeToConvert: string) => {
		let totalMilliseconds = 0;
		timeToConvert
			.split(':')
			.reverse()
			.forEach((time, index) => {
				if (index === 0) totalMilliseconds += ConverterUtil.timeToMilliseconds(Number(time), 'seconds');
				if (index === 1) totalMilliseconds += ConverterUtil.timeToMilliseconds(Number(time), 'minutes');
				if (index === 2) totalMilliseconds += ConverterUtil.timeToMilliseconds(Number(time), 'hours');
			});

		return totalMilliseconds;
	};

	const seekMilliseconds = getMilliseconds(time);
	const musicMilliseconds = getMilliseconds(musicSubscription.queue[0].duration);

	if (seekMilliseconds < 0 || seekMilliseconds > musicMilliseconds)
		throw new Error(`Seeking beyond limit. [0 - ${musicSubscription.queue[0].duration}]`);

	const { stream, type } = await ytdl.stream(musicSubscription.queue[0].url, { seek: seekMilliseconds / 1000 });
	musicSubscription.resource = createAudioResource(stream, { inputType: type });

	musicSubscription.player.play(musicSubscription.resource);
};

export const loop = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (!musicSubscription.playing) throw new Error("Can't enable loop. Nothing is playing.");

	musicSubscription.looping = !musicSubscription.looping;

	return {
		looping: musicSubscription.looping,
	};
};

export const skip = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length === 1) throw new Error('There are no more items to skip.');
	if (musicSubscription.looping) musicSubscription.looping = false;
	if (musicSubscription.player.state.status === AudioPlayerStatus.Paused) musicSubscription.player.unpause();

	const skippedItem = musicSubscription.queue[0].title;

	musicSubscription.player.stop();
	await play(guildId);

	return {
		skippedItem,
		playing: musicSubscription.queue[0].title,
	};
};

export const pause = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

	musicSubscription.player.pause();

	return {
		pausedItem: musicSubscription.queue[0].title,
	};
};

export const resume = async (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;
	if (musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

	musicSubscription.player.unpause();

	return {
		resumedItem: musicSubscription.queue[0].title,
	};
};

export const queue = (guildId: string) => {
	const musicSubscription = Bot.music.get(guildId)!;

	const queue = [...musicSubscription.queue];
	const playing = queue.shift();

	return {
		playing,
		queue,
	};
};
