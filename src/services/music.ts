import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { GuildMember, VoiceBasedChannel } from 'discord.js';
import * as ytdl from 'play-dl';
import { Bot } from '../bot';
import * as ConverterUtil from '../utils/converter';
import * as Sleep from '../utils/sleep';
import { QueueItem } from '../types/bot';

const playerOnIdle = async (client: Bot, guildId: string) => {
	const musicSubscription = client.music.get(guildId)!;

	musicSubscription.player.stop();
	musicSubscription.playing = false;

	if(!musicSubscription.looping) musicSubscription.queue.shift();

	if(musicSubscription.queue.length > 0) {
        await Sleep.timeout(500);
        return await play(client, guildId);
	}

    await Sleep.timeout(1000 * 60 * 10);
    leave(client, guildId);
}

const play = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;

	const { stream, type } = await ytdl.stream(musicSubscription.queue[0].url);
	musicSubscription.resource = createAudioResource(stream, { inputType: type });

	musicSubscription.playing = true;
	musicSubscription.player.play(musicSubscription.resource);
}

export const join = (client: Bot, guildId: string, member: GuildMember) => {
    const voiceChannel = member.voice.channel as VoiceBasedChannel;

    const subscription = {
        player: createAudioPlayer(),
		resource: null,
		connection: joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guild.id, adapterCreator: voiceChannel.guild.voiceAdapterCreator }),
		playing: false,
		looping: false,
		queue: [] as QueueItem[]
    }

    subscription.connection.subscribe(subscription.player);
	subscription.player.on(AudioPlayerStatus.Idle, async () => await playerOnIdle(client, guildId));
	client.music.set(guildId, subscription);
}

export const leave = (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;

	musicSubscription.player.stop();
	musicSubscription.connection.destroy();
	client.music.delete(guildId);
}

export const addToQueue = async (client: Bot, guildId: string, queueItem: QueueItem) => {
    const musicSubscription = client.music.get(guildId)!;

    if(musicSubscription.queue.length === 0) {
        musicSubscription.playing = true;
		musicSubscription.queue = [queueItem];
	
		await play(client, guildId);
    }
    else {
        const hasEntry = musicSubscription.queue.some(item => JSON.stringify(item) === JSON.stringify(queueItem));
        if(hasEntry) throw new Error('Entry already exists in the queue.');

        musicSubscription.queue.push(queueItem);
    }

    return { position: musicSubscription.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(queueItem)) };
}

export const removeFromQueue = async (client: Bot, guildId: string, position: number) => {
    const musicSubscription = client.music.get(guildId)!;
    if(musicSubscription.queue.length === 0) throw new Error('Queue is empty.');
    if(position < 1 || position > musicSubscription.queue.length) throw new Error('Invalid queue position.');

    musicSubscription.queue.splice(position, 1);
}

export const clearQueue = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
    if(musicSubscription.queue.length <= 1) throw new Error('Queue is already empty.');

    musicSubscription.queue.length = 1;
}

export const seek = async (client: Bot, guildId: string, time: string) => {
    if(!/([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(time)) throw new Error('Invalid time format. Use the following format hh?:mm:ss where ? is optional.');

    const musicSubscription = client.music.get(guildId)!;
    if(musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

    let seekMilliseconds = 0, musicMilliseconds = 0;

    const seekUnits = time.split(':').reverse();
    seekUnits.forEach((item, index) => {
        if(index === 0) seekMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'seconds')
        if(index === 1) seekMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'minutes')
        if(index === 2) seekMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'hours')
    });

    const musicUnits = musicSubscription.queue[0].duration.split(':').reverse();
    musicUnits.forEach((item, index) => {
        if(index === 0) musicMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'seconds')
        if(index === 1) musicMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'minutes')
        if(index === 2) musicMilliseconds += ConverterUtil.timeToMilliseconds(Number(item), 'hours')
    });

    if(seekMilliseconds < 0 || seekMilliseconds > musicMilliseconds) throw new Error(`Seeking beyond limit. [0 - ${musicSubscription.queue[0].duration}]`);

    const { stream, type } = await ytdl.stream(musicSubscription.queue[0].url, { seek: seekMilliseconds / 1000 });
    musicSubscription.resource = createAudioResource(stream, { inputType: type });

    musicSubscription.player.play(musicSubscription.resource);
}

export const loop = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
	if(!musicSubscription.playing) throw new Error('Can\'t enable loop. Nothing is playing.');

	musicSubscription.looping = !musicSubscription.looping;

    return { looping: musicSubscription.looping };
}

export const skip = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
	if(musicSubscription.looping) musicSubscription.looping = false;

    const skippedItem =  musicSubscription.queue[0].title;

    if(musicSubscription.queue.length === 1) throw new Error('There are no more items to skip.');

    musicSubscription.player.stop();
	await play(client, guildId);

    return { skippedItem, playing: musicSubscription.queue[0].title };
}

export const pause = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
    if(musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

	musicSubscription.player.pause();

    return { pausedItem: musicSubscription.queue[0].title };
}

export const resume = async (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
    if(musicSubscription.queue.length === 0) throw new Error('Queue is empty.');

	musicSubscription.player.unpause();

    return { resumedItem: musicSubscription.queue[0].title };
}

export const queue = (client: Bot, guildId: string) => {
    const musicSubscription = client.music.get(guildId)!;
    const playing = musicSubscription.queue[0];

    return { playing, queue: musicSubscription.queue };
}