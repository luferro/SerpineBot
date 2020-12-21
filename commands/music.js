const scrapeYt = require('scrape-yt');
const ytdl = require('ytdl-core');

const opts_SCRAPE = {
    limit: 10,
    type: 'video'
};
const streamOptions = {
	seek: 0,
	volume: 1,
};

const serverMusic = new Map();

module.exports = {
	name: 'music',
	async execute(message, args) {
		message.delete({ timeout: 5000 });

		if (!args[1]) return message.channel.send('Usage: ./play <Youtube query>').then(m => { m.delete({ timeout: 5000 }) });

		const serverQueue = serverMusic.get(message.guild.id); 

		let argsmusic = args.slice(1).join(' ');
            
        try {
            if (message.member.voice.channel) {
				const results = await scrapeYt.search(argsmusic, opts_SCRAPE).catch(err => console.log(err));
    
                if (ytdl.validateURL(`https://www.youtube.com/watch?v=${results[0].id}`)) {
                    const music = {
						title: results[0].title,
						url: `https://www.youtube.com/watch?v=${results[0].id}`,
						duration: Math.floor(results[0].duration / 60) + ":" + ((results[0].duration - Math.floor(results[0].duration / 60) * 60) < 10 ? "0" + (results[0].duration - Math.floor(results[0].duration / 60) * 60) : (results[0].duration - Math.floor(results[0].duration / 60) * 60))
					};

					if (serverQueue) {
						serverQueue.queue.push(music);

						return message.channel.send({embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							title: `Queue for ${message.guild.name}`,
							description: `**${serverQueue.queue[serverQueue.queue.length - 1].title} | ${serverQueue.queue[serverQueue.queue.length -1].duration}** has been added.`
						}}).then(m => { m.delete({ timeout: 5000 }) });
					}
					else {
						const serverDetails = {
							dispatcher: null,
							connection: null,
							playing: true,
							looping: false,
							searching: false,
							searched_music: null,
							queue: []							
						};

						serverMusic.set(message.guild.id, serverDetails);
						serverDetails.queue.push(music);

						serverDetails.connection = await message.member.voice.channel.join();

						await this.play(message);
					}
                } else
                    return message.channel.send('Invalid Youtube URL.').then(m => { m.delete({ timeout: 5000 }) });
            } else
                return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
        } catch (error) {
            console.log(error);
        }
	},
	async play(message) {
		const serverQueue = serverMusic.get(message.guild.id);

        const stream = ytdl(serverQueue.queue[0].url, { filter: 'audioonly' });
		serverQueue.dispatcher = serverQueue.connection.play(stream, streamOptions);
        serverQueue.playing = true;
        
        serverQueue.dispatcher.on('start', () => {
            console.log(`Now playing ${serverQueue.queue[0].title}`);
        });

		serverQueue.dispatcher.on('finish', () => {
			if (serverQueue.looping) {
				setTimeout(() => {
					this.play(message);
				}, 500);
			} else {
				serverQueue.queue.shift();

				if (serverQueue.queue.length === 0) {
					serverQueue.playing = false;
					setTimeout(() => {
						serverMusic.delete(message.guild.id);
						message.member.voice.channel.leave();
					}, 1000 * 60);
				} else {
					setTimeout(() => {
						this.play(message);
					}, 500);
				}
			}
		});
    },
	loop(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id); 

		if (serverQueue.queue.length === 0) return message.channel.send("Can't enable loop. There are no songs on queue.").then(m => { m.delete({ timeout: 5000 }) });

		serverQueue.looping = !serverQueue.looping;

		if (serverQueue.looping)
			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Loop has been enabled. Set to ${serverQueue.queue[0].title}`,
			}}).then(m => { m.delete({ timeout: 5000 }) });
		else
			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: 'Loop has been disabled.',
                }}).then(m => { m.delete({ timeout: 5000 }) });
	},
	async search(message, args) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		try {
			if (message.member.voice.channel) {
				if (!args[1]) return message.channel.send('Usage: ./search <Youtube query>').then(m => { m.delete({ timeout: 5000 }) });

				let argssearch = args.slice(1).join(' ');

				if(!serverQueue) {
					const serverDetails = {
						dispatcher: null,
						connection: await message.member.voice.channel.join(),
						playing: false,
						looping: false,
						searching: true,
						searched_music: argssearch,
						queue: []							
					};
		
					serverMusic.set(message.guild.id, serverDetails);
				}
				else {
					serverQueue.searching = true;
					serverQueue.searched_music = argssearch;
				}

                const results = await scrapeYt.search(argssearch, opts_SCRAPE);

				let all_results = [], option = 0;
				results.forEach(music => {
					all_results.push({
						key: ++option,
						title: music.title
					})
				});                

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: `Search results for ${argssearch}`,
                    description: all_results.map(result => `**${result.key}** - ${result.title}\n`).join('\n'),
                }}).then(m => { m.delete({ timeout: 1000 * 60 * 5 }) });
					
				
			} else
				return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
		} catch (error) {
			console.log(error);
		}
	},
	async search_play(message) {
		const option = Number(message.content);

		const serverQueue = serverMusic.get(message.guild.id);
		try {
			if (message.member.voice.channel && serverQueue.searched_music) {		
				const results = await scrapeYt.search(serverQueue.searched_music, opts_SCRAPE);

				if (serverQueue.queue.length === 0) serverQueue.playing = false;

				if (serverQueue.searching) {
					serverQueue.queue.push({
						title: results[option - 1].title,
						url: `https://www.youtube.com/watch?v=${results[option - 1].id}`,
						duration: Math.floor(results[option - 1].duration / 60) + ":" + ((results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60) < 10 ? "0" + (results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60) : (results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60))
					})

					serverQueue.connection = await message.member.voice.channel.join();

					message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: `Queue for ${message.guild.name}`,
                        description: `**${serverQueue.queue[serverQueue.queue.length - 1].title} | ${serverQueue.queue[serverQueue.queue.length - 1].duration}** has been added.`
                    }}).then(m => { m.delete({ timeout: 5000 }) });

					serverQueue.searching = false;

                    if (!serverQueue.playing) await this.play(message);
				} else return;
			} else return;
		} catch (error) {
			console.log(error);
		}
	},
	async skip(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);
		try {
			serverQueue.queue.shift();

			if (serverQueue.queue.length === 0) {
				serverMusic.delete(message.guild.id);
				return message.member.voice.channel.leave();
			}

			serverQueue.connection = await message.member.voice.channel.join();

			await this.play(message);
		} catch (error) {
			console.log(error);
		}
	},
	clear(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		serverQueue.queue.splice(1, serverQueue.length - 1);

		message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `Updated queue for ${message.guild.name}`,
            description: `Queue has been cleared.`,
        }}).then(m => { m.delete({ timeout: 5000 }) });
	},
	remove(message, args) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		if (!args[1]) return message.channel.send('Usage: ./remove <index>').then(m => { m.delete({ timeout: 5000 }) });
		if (args[1] == 1) return message.channel.send("Can't remove a song that is currently playing.").then(m => { m.delete({ timeout: 5000 }) });

		serverQueue.queue.splice(args[1] - 1, 1);

		let full_queue = [], option = 0;
		serverQueue.queue.forEach(music => {
			full_queue.push({
				key: ++option,
				title: music.title,
				duration: music.duration
			})
		});		

		message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `Updated queue for ${message.guild.name}`,
            description: full_queue.map(queue => `**${queue.key}** - ${queue.title} | ${queue.duration}\n`).join('\n'),
        }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
	},
	queue(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		if (serverQueue.queue.length === 0) {
			message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `Queue for ${message.guild.name}`,
                description: 'Nothing has been queued.',
            }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
		} else {			
			let full_queue = [], option = 0;
			serverQueue.queue.forEach(music => {
				full_queue.push({
					key: ++option,
					title: music.title,
					duration: music.duration
				})
			});	

			message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `Queue for ${message.guild.name}`,
                description: full_queue.map(queue => `**${queue.key}** - ${queue.title} | ${queue.duration}\n`).join('\n'),
            }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
		}
	},
	pause(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		if (message.member.voice.channel) {
			serverQueue.dispatcher.pause();

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Pausing ${serverQueue.queue[0].title}`
			}}).then(m => { m.delete({ timeout: 5000 }) });
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) })
	},
	resume(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

		if (message.member.voice.channel) {
			serverQueue.dispatcher.resume();

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Resuming ${serverQueue.queue[0].title}`
			}}).then(m => { m.delete({ timeout: 5000 }) });
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	volume(message, args) {
		message.delete({ timeout: 5000 });

		const chosenVolume = message.content.match(/[0-9]+/g);
		const serverQueue = serverMusic.get(message.guild.id);

		if(!args[1] || (chosenVolume[0] < 0 && chosenVolume[0] > 100)) return message.channel.send('Usage: ./volume <0-100>').then(m => { m.delete({ timeout: 5000 }) });

		if (message.member.voice.channel) {
			serverQueue.dispatcher.setVolume(chosenVolume[0] / 100);

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: `Setting volume to ${chosenVolume[0]}%`
			}}).then(m => { m.delete({ timeout: 5000 }) });
		} else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
	},
	async join(message) {
		message.delete({ timeout: 5000 });

		const serverQueue = serverMusic.get(message.guild.id);

        try {
            if (message.member.voice.channel) {
				if(!serverQueue) {
					const serverDetails = {
						dispatcher: null,
						connection: null,
						playing: false,
						looping: false,
						searching: false,
						searched_music: null,
						queue: []							
					};
		
					serverMusic.set(message.guild.id, serverDetails);
				}
                await message.member.voice.channel.join();
            } else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
        } catch (error) {
            console.log(error);   
        }
	},
	async leave(message) {
		message.delete({ timeout: 5000 });

        try {
            if (message.member.voice.channel) {
				serverMusic.delete(message.guild.id);
                await message.member.voice.channel.leave();
            } else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
        } catch (error) {
            console.log(error);
        }
	}
};
