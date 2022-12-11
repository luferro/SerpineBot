import type { GuildMember, VoiceBasedChannel } from 'discord.js';
import type { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import type { QueueItem } from '../types/bot';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { YoutubeApi } from '@luferro/google-api';
import { ConverterUtil, SleepUtil } from '@luferro/shared-utils';
import { Bot } from '../structures/bot';

const getGuildSubscription = (guildId: string) => {
	const subscription = Bot.music.get(guildId);
	if (!subscription) throw new Error(`Guild ${guildId} isn't subscribed.`);
	return subscription;
};

const playerOnIdle = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	subscription.player.stop();
	subscription.playing = false;

	if (!subscription.looping) subscription.queue.shift();

	if (subscription.queue.length > 0) {
		await SleepUtil.sleep(500);
		return await play(guildId);
	}

	await SleepUtil.sleep(1000 * 60 * 10);
	leave(guildId);
};

const play = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	const firstQueueItem = subscription.queue[0].url;

	const param = new URL(firstQueueItem).searchParams.get('t');
	if (param) {
		subscription.playing = true;
		const timestamp = Number(param.match(/\d+/)?.[0] ?? 0) * 1000;
		await seek(guildId, ConverterUtil.toMinutes(timestamp, true) as string);
		return;
	}

	const { stream, type } = await YoutubeApi.stream(firstQueueItem);
	subscription.resource = createAudioResource(stream, { inputType: type });

	subscription.playing = true;
	subscription.player.play(subscription.resource);
};

const verifyClientConnection = (guildId: string, shouldBeConnected: boolean) => {
	const isConnected = Bot.music.has(guildId);
	if (!isConnected && shouldBeConnected) throw new Error('SerpineBot is not connected to a voice channel.');
	if (isConnected && !shouldBeConnected) throw new Error('SerpineBot is already connect to a voice channel.');
};

export const join = (guildId: string, member: GuildMember) => {
	verifyClientConnection(guildId, false);

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
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	subscription.player.stop();
	subscription.connection.destroy();

	Bot.music.delete(guildId);
};

export const addToQueue = async (guildId: string, queueItem: QueueItem) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) {
		subscription.playing = true;
		subscription.queue = [queueItem];

		await play(guildId);
	} else {
		const hasEntry = subscription.queue.some((item) => JSON.stringify(item) === JSON.stringify(queueItem));
		if (hasEntry) throw new Error('Duplicated entry detected.');

		subscription.queue.push(queueItem);
	}

	return {
		position: subscription.queue.findIndex((item) => JSON.stringify(item) === JSON.stringify(queueItem)),
	};
};

export const removeFromQueue = async (guildId: string, position: number) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');
	if (position < 1 || position > subscription.queue.length) throw new Error('Invalid queue position.');

	subscription.queue.splice(position, 1);
};

export const clearQueue = async (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length <= 1) throw new Error('Queue is already empty.');

	subscription.queue.length = 1;
};

export const seek = async (guildId: string, timestamp: string) => {
	verifyClientConnection(guildId, true);

	const isValidTimestamp = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(timestamp);
	if (!isValidTimestamp) throw new Error('Invalid timestamp format.');

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');

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

	const seekMilliseconds = getMilliseconds(timestamp);
	const musicMilliseconds = getMilliseconds(subscription.queue[0].duration);

	if (seekMilliseconds < 0 || seekMilliseconds > musicMilliseconds)
		throw new Error(`Seeking beyond limit. [0 - ${subscription.queue[0].duration}]`);

	const { stream, type } = await YoutubeApi.stream(subscription.queue[0].url, seekMilliseconds);
	subscription.resource = createAudioResource(stream, { inputType: type });

	subscription.player.play(subscription.resource);
};

export const loop = async (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (!subscription.playing) throw new Error('Cannot enable loop. Nothing is currently playing.');

	subscription.looping = !subscription.looping;

	return {
		looping: subscription.looping,
	};
};

export const skip = async (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 1) throw new Error('Cannot skip. Queue is empty.');

	if (subscription.looping) subscription.looping = false;
	if (subscription.player.state.status === AudioPlayerStatus.Paused) subscription.player.unpause();

	const skippedItem = subscription.queue[0].title;
	subscription.player.stop();
	await play(guildId);

	return {
		skippedItem,
		playing: subscription.queue[0].title,
	};
};

export const pause = async (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');

	subscription.player.pause();

	return {
		pausedItem: subscription.queue[0].title,
	};
};

export const resume = async (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');

	subscription.player.unpause();

	return {
		resumedItem: subscription.queue[0].title,
	};
};

export const queue = (guildId: string) => {
	verifyClientConnection(guildId, true);

	const subscription = getGuildSubscription(guildId);
	const queue = [...subscription.queue];

	return {
		queue,
		playing: queue.shift(),
	};
};
