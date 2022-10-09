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

	const { searchParams } = new URL(firstQueueItem);
	const timestamp = searchParams.get('t');
	if (timestamp) {
		subscription.playing = true;
		await seek(guildId, ConverterUtil.toMinutes(Number(timestamp) * 1000, true) as string);
		return;
	}

	const { stream, type } = await YoutubeApi.stream(firstQueueItem);
	subscription.resource = createAudioResource(stream, { inputType: type });

	subscription.playing = true;
	subscription.player.play(subscription.resource);
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
	const subscription = getGuildSubscription(guildId);

	subscription.player.stop();
	subscription.connection.destroy();
	Bot.music.delete(guildId);
};

export const addToQueue = async (guildId: string, queueItem: QueueItem) => {
	const subscription = getGuildSubscription(guildId);

	if (subscription.queue.length === 0) {
		subscription.playing = true;
		subscription.queue = [queueItem];

		await play(guildId);
	} else {
		const hasEntry = subscription.queue.some((item) => JSON.stringify(item) === JSON.stringify(queueItem));
		if (hasEntry) throw new Error('Entry already exists in the queue.');

		subscription.queue.push(queueItem);
	}

	const position = subscription.queue.findIndex((item) => JSON.stringify(item) === JSON.stringify(queueItem));

	return { position };
};

export const removeFromQueue = async (guildId: string, position: number) => {
	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');
	if (position < 1 || position > subscription.queue.length) throw new Error('Invalid queue position.');

	subscription.queue.splice(position, 1);
};

export const clearQueue = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length <= 1) throw new Error('Queue is already empty.');

	subscription.queue.length = 1;
};

export const seek = async (guildId: string, timestamp: string) => {
	if (!/([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(timestamp))
		throw new Error('Invalid timestamp format. Use the following format hh?:mm:ss where ? is optional.');

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
	const subscription = getGuildSubscription(guildId);
	if (!subscription.playing) throw new Error("Can't enable loop. Nothing is playing.");

	subscription.looping = !subscription.looping;
	const looping = subscription.looping;

	return { looping };
};

export const skip = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 1) throw new Error('There are no more items to skip.');

	const skippedItem = subscription.queue[0].title;

	if (subscription.looping) subscription.looping = false;
	if (subscription.player.state.status === AudioPlayerStatus.Paused) subscription.player.unpause();

	subscription.player.stop();
	await play(guildId);
	const playing = subscription.queue[0].title;

	return { skippedItem, playing };
};

export const pause = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');

	subscription.player.pause();
	const pausedItem = subscription.queue[0].title;

	return { pausedItem };
};

export const resume = async (guildId: string) => {
	const subscription = getGuildSubscription(guildId);
	if (subscription.queue.length === 0) throw new Error('Queue is empty.');

	subscription.player.unpause();
	const resumedItem = subscription.queue[0].title;

	return { resumedItem };
};

export const queue = (guildId: string) => {
	const subscription = getGuildSubscription(guildId);

	const queue = [...subscription.queue];
	const playing = queue.shift();

	return { playing, queue };
};
