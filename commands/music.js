import { MessageEmbed } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import youtubeService from 'youtubei';
import { erase } from '../utils/message.js';
import { formatSecondsToMinutes } from '../utils/format.js';
import musicSchema from '../models/musicSchema.js';

const youtube = new youtubeService.Client();
const subscriptions = new Map();

const playerOnIdle = guild => {
	const serverSubscription = subscriptions.get(guild);

	serverSubscription.player.stop();

	if(serverSubscription.looping) return setTimeout(() => play(guild), 500);

	serverSubscription.queue.shift();
	if(serverSubscription.queue.length === 0) return setTimeout(() => serverSubscription.connection.destroy(), 1000 * 60 * 10);

	setTimeout(() => play(guild), 500);
}

const play = async guild => {
	const serverSubscription = subscriptions.get(guild);
	const volume = await musicSchema.findOne({ guild });

	const stream = ytdl(serverSubscription.queue[0].url, serverSubscription.queue[0]?.livestream ? { quality: [128, 127, 120, 96, 95, 94, 93] } : { filter: 'audioonly', highWaterMark: 1 << 32 });
	serverSubscription.resource = createAudioResource(stream, { inlineVolume: true });
	serverSubscription.resource.volume.setVolume(volume?.volume || 1);

	serverSubscription.playing = true;
	serverSubscription.player.play(serverSubscription.resource);
}

const setup = async(message, args) => {
	erase(message, 5000);

	const query = args.slice(1).join(' ');
	if(!query) return message.channel.send({ content: './cmd music' });
	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const results = await youtube.search(query, { type: 'video' });
	if(!ytdl.validateURL(`https://www.youtube.com/watch?v=${results[0].id}`)) return message.channel.send({ content: 'Invalid Youtube URL.' }).then(m => erase(m, 5000));

	const music = {
		channel: results[0].channel.name,
		title: results[0].title,
		thumbnail: results[0].thumbnails[0]?.url,
		url: `https://www.youtube.com/watch?v=${results[0].id}`,
		duration: formatSecondsToMinutes(results[0].duration),
		livestream: results[0].isLive
	};

	const serverSubscription = subscriptions.get(message.guild.id);
	if(serverSubscription?.queue.length > 0) {
		const musicExists = serverSubscription.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
		if (musicExists) return message.channel.send({ content: 'Selected song is already in the queue.' }).then(m => erase(m, 5000));

		serverSubscription.queue.push(music);

		return message.channel.send({
			embeds: [
				new MessageEmbed()
					.setAuthor('Added to queue', message.author.avatarURL())
					.setTitle(music.title)
					.setURL(music.url)
					.setThumbnail(music.thumbnail || '')
					.addField('**Position in queue**', serverSubscription.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)).toString(), true)
					.addField('**Channel**', music.channel, true)
					.addField('**Duration**', music.duration, true)
					.setColor(Math.floor(Math.random() * 16777214) + 1)
			]
		}).then(m => erase(m, 1000 * 60));
	}

	const subscriptionsConfig = {
		player: createAudioPlayer(),
		resource: null,
		connection: joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.member.voice.channel.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator }),
		playing: true,
		looping: false,
		searching: false,
		query: null,
		queue: [music]
	};

	subscriptions.set(message.guild.id, subscriptionsConfig);
	subscriptionsConfig.connection.subscribe(subscriptionsConfig.player);
	subscriptionsConfig.player.on(AudioPlayerStatus.Idle, () => playerOnIdle(message.guild.id));
	subscriptionsConfig.player.on('error', console.log);

	play(message.guild.id);

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor('Started playing', message.author.avatarURL())
				.setTitle(music.title)
				.setURL(music.url)
				.setThumbnail(music.thumbnail || '')
				.addField('Position in queue', 'Currently playing', true)
				.addField('Channel', music.channel, true)
				.addField('Duration', music.duration, true)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60));
}

const loop = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));
	if(serverSubscription.queue.length === 0) return message.channel.send({ content: 'Can\'t enable loop. There are no songs in the queue.' }).then(m => erase(m, 5000));

	serverSubscription.looping = !serverSubscription.looping;

	if(serverSubscription.looping) {
		return message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(`Loop has been enabled. Set to \`${serverSubscription.queue[0].title}\``)
					.setColor(Math.floor(Math.random() * 16777214) + 1)
			]
		}).then(m => erase(m, 5000));
	}

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle('Loop has been disabled.')
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 5000));
}

const search = async(message, args) => {
	erase(message, 5000);

	const query = args.slice(1).join(' ');
	if(!query) return message.channel.send({ content: './cmd music' });

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	if(!subscriptions.has(message.guild.id)) join(message);

	const serverSubscription = subscriptions.get(message.guild.id);
	serverSubscription.searching = true;
	serverSubscription.query = query;

	if(!serverSubscription.player) {
		serverSubscription.player = createAudioPlayer();
		serverSubscription.connection.subscribe(serverSubscription.player);
		serverSubscription.player.on(AudioPlayerStatus.Idle, () => playerOnIdle(message.guild.id));
		serverSubscription.player.on('error', console.log);
	}

	const results = await youtube.search(query, { type: 'video' });
	results.length = results.length >= 10 ? 10 : results.length;

	let option = 0;
	const list = [];
	results.forEach(item => list.push(`\`${++option}.\` **[${item.title}](${item.url})** | \`${formatSecondsToMinutes(item.duration)}\``));

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Search results for \`${query}\``)
				.setDescription(list.join('\n'))
				.setFooter('Type `cancel` to stop searching.')
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60 * 5));
}

const selectSearchOption = async message => {
	const serverSubscription = message.guild && subscriptions.get(message.guild.id);

	if(message.content === 'cancel') serverSubscription.searching = false;
	if(!message.member?.voice.channel || !serverSubscription?.searching || isNaN(message.content) || message.content === '') return;
	if(serverSubscription.queue.length === 0) serverSubscription.playing = false;

	const option = parseInt(message.content);
	const results = await youtube.search(serverSubscription.query, { type: 'video' });

	const music = {
		channel: results[option - 1].channel.name,
		title: results[option - 1].title,
		thumbnail: results[option - 1].thumbnails[0]?.url,
		url: `https://www.youtube.com/watch?v=${results[option - 1].id}`,
		duration: formatSecondsToMinutes(results[option - 1].duration),
		livestream: results[option - 1].isLive
	};

	const musicExists = serverSubscription.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
	if (musicExists) return message.channel.send({ content: 'Selected song is already in the queue.' }).then(m => erase(m, 5000));

	serverSubscription.queue.push(music);
	serverSubscription.searching = false;

	if(serverSubscription.playing) {
		return message.channel.send({
			embeds: [
				new MessageEmbed()
					.setAuthor('Added to queue', message.author.avatarURL())
					.setTitle(music.title)
					.setURL(music.url)
					.setThumbnail(music.thumbnail || '')
					.addField('Position in queue', serverSubscription.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)).toString(), true)
					.addField('Channel', music.channel, true)
					.addField('Duration', music.duration, true)
					.setColor(Math.floor(Math.random() * 16777214) + 1)
			]
		}).then(m => erase(m, 1000 * 60));
	}

	play(message.guild.id);

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor('Started playing', message.author.avatarURL())
				.setTitle(music.title)
				.setURL(music.url)
				.setThumbnail(music.thumbnail || '')
				.addField('Position in queue', 'Currently playing', true)
				.addField('Channel', music.channel, true)
				.addField('Duration', music.duration, true)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60));
}

const skip = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	if(serverSubscription.looping) serverSubscription.looping = !serverSubscription.looping;

	serverSubscription.player.stop();
	serverSubscription.queue.shift();
	if(serverSubscription.queue.length === 0) return message.channel.send({ content: 'There are no more songs to skip!' }).then(m => erase(m, 5000));

	play(message.guild.id);
}

const clear = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	serverSubscription.queue.length = 1;

	const queue = `
		\n__Now Playing:__\n[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url}) | \`${serverSubscription.queue[0].duration}\` \`requested by ${message.author.tag}\`
		\n__Up Next:__\nQueue is empty.
		\n**0** songs in queue.
	`;

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Queue for ${message.guild.name}`)
				.setDescription(queue)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60));
}

const remove = (message, args) => {
	erase(message, 5000);

	if(!args[1]) return message.channel.send({ content: './cmd music' });
	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));
	if(args[1] <= 0) return message.channel.send({ content: 'Invalid input.' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	serverSubscription.queue.splice(args[1], 1);

	let option = 0;
	const updatedQueue = [];
	serverSubscription.queue.forEach((item, index) => {
		if(index !== 0) updatedQueue.push(`\`${++option}.\` **[${item.title}](${item.url})**\n\`${item.duration}\` \`requested by ${message.author.tag}\``);
	});
	updatedQueue.length = updatedQueue.length >= 10 ? 10 : updatedQueue.length;

	const queue = `
		\n__Now Playing:__\n**[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url})**\n\`${serverSubscription.queue[0].duration}\` \`requested by ${message.author.tag}\`
		\n__Up Next:__\n${updatedQueue.length > 0 ? updatedQueue.join('\n') : 'Queue is empty.'}
		\n**${updatedQueue.length}** songs in queue.
	`;

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Queue for ${message.guild.name}`)
				.setDescription(queue)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60));
}

const queue = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	let option = 0;
	const upNext = [];
	serverSubscription.queue.forEach((item, index) => {
		if(index !== 0) upNext.push(`\`${++option}.\` **[${item.title}](${item.url})**\n\`${item.duration}\` \`requested by ${message.author.tag}\``);
	});
	upNext.length = upNext.length >= 10 ? 10 : upNext.length;

	const queue = `
		\n__Now Playing:__\n**[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url})**\n\`${serverSubscription.queue[0].duration}\` \`requested by ${message.author.tag}\`
		\n__Up Next:__\n${upNext.length > 0 ? upNext.join('\n') : 'Queue is empty.'}
		\n**${upNext.length}** songs in queue.
	`;

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Queue for ${message.guild.name}`)
				.setDescription(queue)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 1000 * 60));
}

const pause = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	serverSubscription.player.pause();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Pausing \`${serverSubscription.queue[0].title}\``)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 5000));
}

const resume = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	if(!serverSubscription) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	serverSubscription.player.unpause();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Resuming \`${serverSubscription.queue[0].title}\``)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 5000));
}

const volume = async(message, args) => {
	erase(message, 5000);

	const volume = message.content.match(/[0-9]+/g)[0];

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));
	if(!args[1] || volume < 0 || volume > 100) return message.channel.send({ content: './cmd music' });

	await musicSchema.updateOne({ guild: message.guild.id }, { volume: volume / 100 }, { upsert: true });

	if(!subscriptions.has(message.guild.id)) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));
	const serverSubscription = subscriptions.get(message.guild.id);
	serverSubscription.resource.volume.setVolume(volume / 100);

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(`Setting volume to \`${volume}%\``)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(m => erase(m, 5000));
}

const join = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));
	if(subscriptions.has(message.guild.id)) return message.channel.send({ content: 'Bot is already connected to a voice channel!' }).then(m => erase(m, 5000));

	const subscriptionsConfig = {
		player: null,
		resource: null,
		connection: joinVoiceChannel({ channelId: message.member.voice.channel.id, guildId: message.member.voice.channel.guild.id, adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator }),
		playing: false,
		looping: false,
		searching: false,
		query: null,
		queue: []
	};

	subscriptions.set(message.guild.id, subscriptionsConfig);
}

const leave = message => {
	erase(message, 5000);

	if(!message.member.voice.channel) return message.channel.send({ content: 'You must be in a voice channel!' }).then(m => erase(m, 5000));
	if(!subscriptions.has(message.guild.id)) return message.channel.send({ content: 'Bot isn\'t connected!' }).then(m => erase(m, 5000));

	const serverSubscription = subscriptions.get(message.guild.id);
	serverSubscription.player.stop();
	serverSubscription.connection.destroy();
	subscriptions.delete(message.guild.id);
}

export default { setup, loop, search, selectSearchOption, skip, clear, remove, queue, pause, resume, volume, join, leave };