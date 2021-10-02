const { Client } = require('youtubei');
const youtube = new Client();
const ytdl = require('ytdl-core');
const { erase } = require('../utils/message');
const musicSchema = require('../models/musicSchema');

const serverMusic = new Map();
const youtubeOptions = { type: 'video' };
const streamOptions = { seek: 0, volume: 1 };

module.exports = {
	name: 'music',
	secondsToTime(time) {
		const minutes = Math.floor(time % 3600 / 60).toString().padStart(2,'0');
        const seconds = Math.floor(time % 60).toString().padStart(2,'0');

		return `${minutes}:${seconds}`;
	},
	async setup(message, args) {
		erase(message, 5000);

		const query = args.slice(1).join(' ');
		if(!query) return message.channel.send('./cmd music');
			
		if(message.member.voice.channel) {
        	try {
				const results = await youtube.search(query, youtubeOptions);
    
                if(ytdl.validateURL(`https://www.youtube.com/watch?v=${results[0].id}`)) {
                    const music = {
						title: results[0].title,
						url: `https://www.youtube.com/watch?v=${results[0].id}`,
						duration: this.secondsToTime(results[0].duration),
						livestream: results[0].isLive
					};

					const serverQueue = serverMusic.get(message.guild.id); 
					if(serverQueue) {
						const musicExists = serverQueue.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
						if(musicExists) return message.channel.send('Selected song is already in the queue.').then(m => { m.delete({ timeout: 5000 }) });

						serverQueue.queue.push(music);

						message.channel.send({ embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							author: {
								name: 'Added to queue',
								icon_url: message.author.avatarURL()
							},
							title: music.title,
							url: music.url,
							thumbnail: {
								url: results[0].thumbnails[0]?.url
							},
							fields: [
								{
									name: 'Position in queue',
									value: serverQueue.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)),
									inline: true
								},
								{
									name: 'Channel',
									value: results[0].channel.name,
									inline: true
								},
								,
								{
									name: 'Duration',
									value: music.duration,
									inline: true
								}
							]
						}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
					}
					else {					
						const serverDetails = {
							dispatcher: null,
							connection: null,
							playing: true,
							looping: false,
							searching: false,
							query: null,
							queue: []							
						};

						serverMusic.set(message.guild.id, serverDetails);
						serverDetails.queue.push(music);
						serverDetails.connection = await message.member.voice.channel.join();

						this.play(message);

						message.channel.send({ embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							author: {
								name: 'Started playing',
								icon_url: message.author.avatarURL()
							},
							title: music.title,
							url: music.url,
							thumbnail: {
								url: results[0].thumbnails[0]?.url
							},
							fields: [
								{
									name: 'Position in queue',
									value: 'Currently playing',
									inline: true
								},
								{
									name: 'Channel',
									value: results[0].channel.name,
									inline: true
								},
								{
									name: 'Duration',
									value: music.duration,
									inline: true
								}
							]
						}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
					}
                } else return message.channel.send('Invalid Youtube URL.').then(m => { m.delete({ timeout: 5000 }) });
			} catch (error) {
				console.log(error);
			}
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async play(message) {
		try {
			const serverQueue = serverMusic.get(message.guild.id);
			const customVolume = await musicSchema.findOne({ guild: message.guild.id });

			const options = serverQueue.queue[0].livestream ? { quality: [128,127,120,96,95,94,93] } : { filter: 'audioonly' };

			const stream = ytdl(serverQueue.queue[0].url, options);
			serverQueue.dispatcher = serverQueue.connection.play(stream, streamOptions);
			serverQueue.dispatcher.setVolume(customVolume ? customVolume.volume : 1);
			serverQueue.playing = true;

			serverQueue.dispatcher.on('finish', () => {
				if(serverQueue.looping) {
					setTimeout(() => {
						this.play(message);
					}, 500);
				} else {
					serverQueue.queue.shift();
					if(serverQueue.queue.length === 0) {
						setTimeout(() => {
							this.leave(message);
						}, 1000 * 60 * 5);
					} else {
						setTimeout(() => {
							this.play(message);
						}, 500);
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
    },
	loop(message) {
		erase(message, 5000);

		const serverQueue = serverMusic.get(message.guild.id); 

		if(message.member.voice.channel) {
			if(serverQueue.queue.length === 0) return message.channel.send('Can\'t enable loop. There are no songs in the queue.').then(m => { m.delete({ timeout: 5000 }) });

			serverQueue.looping = !serverQueue.looping;

			if(serverQueue.looping) {
				message.channel.send({ embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					title: `Loop has been enabled. Set to \`${serverQueue.queue[0].title}\``,
				}}).then(m => { m.delete({ timeout: 5000 }) });
			}
			else {
				message.channel.send({ embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					title: 'Loop has been disabled.',
				}}).then(m => { m.delete({ timeout: 5000 }) });
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) }); 
	},
	async search(message, args) {
		erase(message, 5000);

		const query = args.slice(1).join(' ');

		if(message.member.voice.channel) {
			try {
				if(!query) return message.channel.send('./cmd music');

				const serverQueue = serverMusic.get(message.guild.id);
				if(!serverQueue) {
					const serverDetails = {
						dispatcher: null,
						connection: null,
						playing: true,
						looping: false,
						searching: true,
						query,
						queue: []							
					};
					serverMusic.set(message.guild.id, serverDetails);
				}
				else {
					serverQueue.searching = true;
					serverQueue.query = query;
				}

                const results = await youtube.search(query, youtubeOptions);
				results.length = results.length >= 10 ? 10 : results.length;

				let option = 0;
				const list = [];
				results.forEach(item => {
					list.push(`\`${++option}.\` [${item.title}](${item.url}) | \`${this.secondsToTime(item.duration)}\`\n`);
				});

                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: `Search results for \`${query}\``,
                    description: list.join('\n'),
					footer: {
						text: 'Type `cancel` to stop searching' 
					}
                }}).then(m => { m.delete({ timeout: 1000 * 60 * 5 }) });
			} catch (error) {
				console.log(error);
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async searchPlay(message) {
		const serverQueue = message.guild && serverMusic.get(message.guild.id);
		if(message.content === 'cancel') serverQueue.searching = false;

		if(message.member?.voice.channel && serverQueue?.searching && !isNaN(message.content)) {
			try {
				if(serverQueue.queue.length === 0) serverQueue.playing = false;

				const results = await youtube.search(serverQueue.query, youtubeOptions);
				const option = parseInt(message.content);

				const music = {
					title: results[option - 1].title,
					url: `https://www.youtube.com/watch?v=${results[option - 1].id}`,
					duration: this.secondsToTime(results[option - 1].duration),
					livestream: results[0].isLive
				}

				const musicExists = serverQueue.queue.some(item => JSON.stringify(item) === JSON.stringify(music));
				if(musicExists) return message.channel.send('Selected song is already in the queue.').then(m => { m.delete({ timeout: 5000 }) });

				serverQueue.queue.push(music);

				serverQueue.connection = await message.member.voice.channel.join();
				serverQueue.searching = false;

				if(serverQueue.playing) {
					message.channel.send({ embed: {
						color: Math.floor(Math.random() * 16777214) + 1,
						author: {
							name: 'Added to queue',
							icon_url: message.author.avatarURL()
						},
						title: music.title,
						url: music.url,
						thumbnail: {
							url: results[option - 1].thumbnails[0]?.url
						},
						fields: [
							{
								name: 'Position in queue',
								value: serverQueue.queue.findIndex(item => JSON.stringify(item) === JSON.stringify(music)),
								inline: true
							},
							{
								name: 'Channel',
								value: results[option - 1].channel.name,
								inline: true
							},
							{
								name: 'Duration',
								value: music.duration,
								inline: true
							}
						]
					}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
				} else {
					this.play(message);

					message.channel.send({ embed: {
						color: Math.floor(Math.random() * 16777214) + 1,
						author: {
							name: 'Started playing',
							icon_url: message.author.avatarURL()
						},
						title: music.title,
						url: music.url,
						thumbnail: {
							url: results[option - 1].thumbnails[0]?.url
						},
						fields: [
							{
								name: 'Position in queue',
								value: 'Currently playing',
								inline: true
							},
							{
								name: 'Channel',
								value: results[option - 1].channel.name,
								inline: true
							},
							{
								name: 'Duration',
								value: music.duration,
								inline: true
							}
						]
					}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
				}
			} catch (error) {
				console.log(error);
			}
		}
	},
	async skip(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			try {
				const serverQueue = serverMusic.get(message.guild.id);
				serverQueue.queue.shift();

				if(serverQueue.queue.length === 0) return message.channel.send('There are no more songs to skip!').then(m => { m.delete({ timeout: 5000 }) });

				serverQueue.connection = await message.member.voice.channel.join();

				this.play(message);
			} catch (error) {
				console.log(error);
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	clear(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			const serverQueue = serverMusic.get(message.guild.id);
			serverQueue.queue.length = 1;

			const queue = `
				__Now Playing:__\n[${serverQueue.queue[0].title}](${serverQueue.queue[0].url}) | \`${serverQueue.queue[0].duration} requested by ${message.author.tag}\`\n
				__Up Next:__\nQueue is empty.\n
				**${serverQueue.queue.length - 1}** songs in queue.
			`;

			message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Queue for ${message.guild.name}`,
				description: queue,
			}}).then(m => { m.delete({ timeout: 5000 }) });
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	remove(message, args) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			if(!args[1]) return message.channel.send('./cmd music');
			if(args[1] === 0) return message.channel.send('Can\'t remove a song that is currently playing.').then(m => { m.delete({ timeout: 5000 }) });

			const serverQueue = serverMusic.get(message.guild.id);
			serverQueue.queue.splice(args[1], 1);

			let option = 0;
			const updatedQueue = [];
			serverQueue.queue.forEach((item, index) => {
				if(index !== 0) updatedQueue.push(`\`${++option}.\` [${item.title}](${item.url}) | \`${item.duration} requested by ${message.author.tag}\`\n`);
			});

			const queue = `
				__Now Playing:__\n[${serverQueue.queue[0].title}](${serverQueue.queue[0].url}) | \`${serverQueue.queue[0].duration} requested by ${message.author.tag}\`\n
				__Up Next:__\n${updatedQueue.length > 0 ? updatedQueue.join('\n') : 'Queue is empty.'}\n
				**${updatedQueue.length}** songs in queue.
			`;

			message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Queue for ${message.guild.name}`,
				description: queue,
			}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	queue(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			const serverQueue = serverMusic.get(message.guild.id);

			if(serverQueue.queue.length === 0) {
				message.channel.send({ embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					title: `Queue for ${message.guild.name}`,
					description: 'Nothing has been queued.',
				}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
			} else {			
				let option = 0;
				const upNext = [];
				serverQueue.queue.forEach((item, index) => {
					if(index !== 0) upNext.push(`\`${++option}.\` [${item.title}](${item.url}) | \`${item.duration} requested by ${message.author.tag}\`\n`);
				});

				const queue = `
					__Now Playing:__\n[${serverQueue.queue[0].title}](${serverQueue.queue[0].url}) | \`${serverQueue.queue[0].duration} requested by ${message.author.tag}\`\n
					__Up Next:__\n${upNext.length > 0 ? upNext.join('\n') : 'Queue is emppty.' }\n
					**${upNext.length}** songs in queue.
				`;

				message.channel.send({ embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					title: `Queue for ${message.guild.name}`,
					description: queue,
				}}).then(m => { m.delete({ timeout: 1000 * 60 }) });
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	pause(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			const serverQueue = serverMusic.get(message.guild.id);
			serverQueue.dispatcher.pause();

			message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Pausing \`${serverQueue.queue[0].title}\``
			}}).then(m => { m.delete({ timeout: 5000 }) });
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) })
	},
	resume(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			const serverQueue = serverMusic.get(message.guild.id);
			serverQueue.dispatcher.resume();

			message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Resuming \`${serverQueue.queue[0].title}\``
			}}).then(m => { m.delete({ timeout: 5000 }) });
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async volume(message, args) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			try {
				const chosenVolume = message.content.match(/[0-9]+/g);
				if(!args[1] || chosenVolume[0] < 0 || chosenVolume[0] > 100) return message.channel.send('./cmd music');

				await musicSchema.updateOne({ guild: message.guild.id }, { volume: chosenVolume[0] / 100 }, { upsert: true });

				const serverQueue = serverMusic.get(message.guild.id);
				serverQueue.dispatcher.setVolume(chosenVolume[0] / 100);

				message.channel.send({ embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					title: `Setting volume to \`${chosenVolume[0]}%\``
				}}).then(m => { m.delete({ timeout: 5000 }) });	
			} catch (error) {
				console.log(error);
			}
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async join(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			try {
				const serverQueue = serverMusic.get(message.guild.id);
				if(!serverQueue) {
					const serverDetails = {
						dispatcher: null,
						connection: null,
						playing: false,
						looping: false,
						searching: false,
						query: null,
						queue: []							
					};
		
					serverMusic.set(message.guild.id, serverDetails);
				}
				await message.member.voice.channel.join();
			} catch (error) {
				console.log(error);   
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async leave(message) {
		erase(message, 5000);

		if(message.member.voice.channel) {
			try {
				serverMusic.delete(message.guild.id);
				await message.member.voice.channel.leave();
			} catch (error) {
				console.log(error);
			}
		}
		else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	}
};
