import { MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import youtubeService from 'youtubei';
import { formatSecondsToMinutes } from '../utils/format.js';
import musicSchema from '../models/musicSchema.js';

const youtube = new youtubeService.Client();
const subscriptions = new Map();

const play = async guild => {
	const serverSubscription = subscriptions.get(guild);
	const volume = await musicSchema.findOne({ guild });

	const stream = ytdl(serverSubscription.queue[0].url, serverSubscription.queue[0]?.livestream ? { quality: [128, 127, 120, 96, 95, 94, 93] } : { filter: 'audioonly', highWaterMark: 1 << 32 });
	serverSubscription.resource = createAudioResource(stream, { inlineVolume: true });
	serverSubscription.resource.volume.setVolume(volume?.volume || 1);

	serverSubscription.playing = true;
	serverSubscription.player.play(serverSubscription.resource);
}

const playerOnIdle = guild => {
	const serverSubscription = subscriptions.get(guild);
	serverSubscription.player.stop();
	serverSubscription.playing = false;

	if(serverSubscription.looping) return setTimeout(() => play(guild), 500);

	serverSubscription.queue.shift();
	if(serverSubscription.queue.length === 0) return setTimeout(() => {
		serverSubscription.player.stop();
		serverSubscription.connection.destroy();
		subscriptions.delete(interaction.guild.id);
	}, 1000 * 60 * 10);

	setTimeout(() => play(guild), 500);
}

const addToQueue = async interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) join(interaction, true);

	const query = interaction.options.getString('query');
	const results = await youtube.search(query, { type: 'video' });

	const music = {
		channel: results[0].channel.name,
		title: results[0].title,
		thumbnail: results[0].thumbnails[0]?.url,
		url: `https://www.youtube.com/watch?v=${results[0].id}`,
		duration: !results[0].isLive ? formatSecondsToMinutes(results[0].duration) : 'LIVE',
		livestream: results[0].isLive,
		requested: interaction.user.tag
	};

	const serverSubscription = subscriptions.get(interaction.guild.id);
	if(serverSubscription.queue.length === 0) {
		serverSubscription.playing = true;
		serverSubscription.queue = [music];
	
		play(interaction.guild.id);
	
		return interaction.reply({ embeds: [
			new MessageEmbed()
				.setAuthor('Started playing', interaction.user.avatarURL())
				.setTitle(music.title)
				.setURL(music.url)
				.setThumbnail(music.thumbnail || '')
				.addField('Position in queue', 'Currently playing', true)
				.addField('Channel', music.channel, true)
				.addField('Duration', music.duration, true)
				.setColor('RANDOM')
		]});
	}

	const musicExists = serverSubscription.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
	if(musicExists) return interaction.reply({ content: 'Selected song is already in the queue.', ephemeral: true });

	serverSubscription.queue.push(music);

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setAuthor('Added to queue', interaction.user.avatarURL())
			.setTitle(music.title)
			.setURL(music.url)
			.setThumbnail(music.thumbnail || '')
			.addField('**Position in queue**', serverSubscription.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)).toString(), true)
			.addField('**Channel**', music.channel, true)
			.addField('**Duration**', music.duration, true)
			.setColor('RANDOM')
	]});
}

const removeFromQueue = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const index = interaction.options.getInteger('index');
	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.queue.splice(index, 1);

	const nowPlaying = serverSubscription.queue.length > 0 ? `**[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url})**\n\`${serverSubscription.queue[0].duration}\` \`requested by ${serverSubscription.queue[0].requested}\`` : 'Nothing is playing.';
	const updatedQueue = serverSubscription.queue.slice(0, 10).map((item, index) => index !== 0 && `\`${index}.\` **[${item.title}](${item.url})**\n\`${item.duration}\` \`requested by ${item.requested}\``).filter(Boolean);

	const queue = `
		\n__Now Playing:__\n${nowPlaying}
		\n__Up Next:__\n${updatedQueue.length > 0 ? updatedQueue.join('\n') : 'Queue is empty.'}
		\n**${updatedQueue.length}** songs in queue.
	`;

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Queue for ${interaction.guild.name}`)
			.setDescription(queue)
			.setColor('RANDOM')
	]});
}

const clearQueue = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const nowPlaying = serverSubscription.queue.length > 0 ? `**[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url})**\n\`${serverSubscription.queue[0].duration}\` \`requested by ${serverSubscription.queue[0].requested}\`` : 'Nothing is playing.'

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.queue.length = 1;

	const queue = `
		\n__Now Playing:__\n${nowPlaying}
		\n__Up Next:__\nQueue is empty.
		\n**0** songs in queue.
	`;

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Queue for ${interaction.guild.name}`)
			.setDescription(queue)
			.setColor('RANDOM')
	]});
}

const queue = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);

	const nowPlaying = serverSubscription.queue.length > 0 ? `**[${serverSubscription.queue[0].title}](${serverSubscription.queue[0].url})**\n\`${serverSubscription.queue[0].duration}\` \`requested by ${serverSubscription.queue[0].requested}\`` : 'Nothing is playing.';
	const upNext = serverSubscription.queue.slice(0, 10).map((item, index) => index !== 0 && `\`${index}.\` **[${item.title}](${item.url})**\n\`${item.duration}\` \`requested by ${item.requested}\``).filter(Boolean);

	const queue = `
		\n__Now Playing:__\n${nowPlaying}
		\n__Up Next:__\n${upNext.length > 0 ? upNext.join('\n') : 'Queue is empty.'}
		\n**${upNext.length}** songs in queue.
	`;

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Queue for ${interaction.guild.name}`)
			.setDescription(queue)
			.setColor('RANDOM')
	]});
}

const search = async interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) join(interaction, true);

	const query = interaction.options.getString('query');
	const results = await youtube.search(query, { type: 'video' });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.searching = true;
	serverSubscription.query = query;

	const searchList = results.slice(0, 10).map((item, index) => `\`${index + 1}.\` **[${item.title}](${item.url})** | \`${!item.isLive ? formatSecondsToMinutes(item.duration) : 'LIVE'}\``).filter(Boolean);
	const options = results.slice(0, 10).map((item, index) => ({ label: `${index + 1}. ${item.title}`, description: !item.isLive ? formatSecondsToMinutes(item.duration) : 'LIVE', value: item.id })).filter(Boolean);
	options.push({ label: 'Cancel', description: `Stop searching for ${query}`, value: 'cancel'});

	const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('selectOption')
			.setPlaceholder('Nothing selected.')
			.addOptions(options)
	);

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Search results for \`${query}\``)
			.setDescription(searchList.join('\n'))
			.setFooter('Select \'Cancel\' from the selection menu to stop searching.')
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });
}

const selectOption = async interaction => {
	const values = interaction.values;
	const serverSubscription = subscriptions.get(interaction.guild.id);

	if(!interaction.member.voice.channel || values.length === 0 || values[0] === 'cancel') {
		serverSubscription.searching = false;
		return interaction.update({ embeds: [
			new MessageEmbed()
				.setTitle('Search has been canceled.')
				.setColor('RANDOM')
		], components: [], ephemeral: true });
	}

	const option = values[0];
	const results = await youtube.search(serverSubscription.query, { type: 'video' });
	const selectedResult = results.find(item => item.id === option);

	const music = {
		channel: selectedResult.channel.name,
		title: selectedResult.title,
		thumbnail: selectedResult.thumbnails[0]?.url,
		url: `https://www.youtube.com/watch?v=${selectedResult.id}`,
		duration: !selectedResult.isLive ? formatSecondsToMinutes(selectedResult.duration) : 'LIVE',
		livestream: selectedResult.isLive,
		requested: interaction.user.tag
	};

	const musicExists = serverSubscription.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
	if(musicExists) return interaction.reply({ content: 'Selected song is already in the queue.', ephemeral: true });

	serverSubscription.queue.push(music);
	serverSubscription.searching = false;
	if(serverSubscription.queue.length === 0) serverSubscription.playing = false;

	if(!serverSubscription.playing) {
		play(interaction.guild.id);

		return interaction.update({ embeds: [
			new MessageEmbed()
				.setAuthor('Started playing', interaction.user.avatarURL())
				.setTitle(music.title)
				.setURL(music.url)
				.setThumbnail(music.thumbnail || '')
				.addField('Position in queue', 'Currently playing', true)
				.addField('Channel', music.channel, true)
				.addField('Duration', music.duration, true)
				.setColor('RANDOM')
		], components: [] });
	}

	interaction.update({ embeds: [
		new MessageEmbed()
			.setAuthor('Added to queue', interaction.user.avatarURL())
			.setTitle(music.title)
			.setURL(music.url)
			.setThumbnail(music.thumbnail || '')
			.addField('Position in queue', serverSubscription.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)).toString(), true)
			.addField('Channel', music.channel, true)
			.addField('Duration', music.duration, true)
			.setColor('RANDOM')
	], components: [] });
}

const loop = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	if(!serverSubscription.playing) return interaction.reply({ content: 'Can\'t enable loop. Nothing is playing.', ephemeral: true });

	serverSubscription.looping = !serverSubscription.looping;

	if(serverSubscription.looping) {
		return interaction.reply({ embeds: [
			new MessageEmbed()
				.setTitle(`Loop has been enabled to \`${serverSubscription.queue[0].title}\`.`)
				.setColor('RANDOM')
		]});
	}

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle('Loop has been disabled.')
			.setColor('RANDOM')
	]});
}

const skip = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	if(serverSubscription.looping) serverSubscription.looping = false;

	const skippedItem = serverSubscription.queue[0];

	serverSubscription.player.stop();
	serverSubscription.queue.shift();
	if(serverSubscription.queue.length === 0) return interaction.reply({ content: 'There are no more items to skip!', ephemeral: true });

	play(interaction.guild.id);

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Skipped \`${skippedItem.title}\`.`)
			.setColor('RANDOM')
	]});
}

const pause = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.player.pause();

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Pausing \`${serverSubscription.queue[0].title}\`.`)
			.setColor('RANDOM')
	]});
}

const resume = interaction => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.player.unpause();

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Resuming \`${serverSubscription.queue[0].title}\`.`)
			.setColor('RANDOM')
	]});
}

const volume = async interaction => {
	const volume = interaction.options.getInteger('volume');

	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	await musicSchema.updateOne({ guild: interaction.guild.id }, { volume: volume / 100 }, { upsert: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.resource.volume.setVolume(volume / 100);

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Setting volume to \`${volume}%\`.`)
			.setColor('RANDOM')
	]});
}

const join = (interaction, forwardInteraction = false) => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot is already connected to a voice channel!', ephemeral: true });

	const subscription = {
		player: createAudioPlayer(),
		resource: null,
		connection: joinVoiceChannel({ channelId: interaction.member.voice.channel.id, guildId: interaction.member.voice.channel.guild.id, adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator }),
		playing: false,
		looping: false,
		searching: false,
		query: null,
		queue: []
	};
	subscription.connection.subscribe(subscription.player);
	subscription.player.on(AudioPlayerStatus.Idle, () => playerOnIdle(interaction.guild.id));
	subscription.player.on('error', console.log);
	subscriptions.set(interaction.guild.id, subscription);

	if(!forwardInteraction) interaction.reply({ content: 'Bot has joined your voice channel! ', ephemeral: true });
}

const leave = (interaction) => {
	if(!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
	if(!subscriptions.has(interaction.guild.id)) return interaction.reply({ content: 'Bot isn\'t connected!', ephemeral: true });

	const serverSubscription = subscriptions.get(interaction.guild.id);
	serverSubscription.player.stop();
	serverSubscription.connection.destroy();
	subscriptions.delete(interaction.guild.id);

	interaction.reply({ content: 'Bot has left your voice channel! ', ephemeral: true });
}

export default { addToQueue, removeFromQueue, clearQueue, queue, search, selectOption, loop, skip, pause, resume, volume, join, leave };