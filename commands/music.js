const scrapeYt = require('scrape-yt');
const ytdl = require('ytdl-core');

const opts_SCRAPE = {
    limit: 20,
    type: 'video'
};
const streamOptions = {
	seek: 0,
	volume: 1,
};

const queue = [],
	queue_title = [],
	queue_duration = [],
	playing = true,
	looping = false,
	searching = false,
	searched_music = '';

module.exports = {
	name: 'music',
	async execute(message, args) {
		message.delete({ timeout: 5000 });

		if (!args[1]) return message.channel.send('Usage: ./play <Youtube query>').then(m => { m.delete({ timeout: 5000 }) });

		let connection,
			argsmusic = args.slice(1).join(' '),
			music_url,
			music_title,
            music_duration;
            
        try {
            if (message.member.voice.channel) {
                let results = await scrapeYt.search(argsmusic, opts_SCRAPE).catch(err => console.log(err));
                music_url = `https://www.youtube.com/watch?v=${results[0].id}`;
                music_title = results[0].title;
                music_duration = Math.floor(results[0].duration / 60) + ":" + ((results[0].duration - Math.floor(results[0].duration / 60) * 60) < 10 ? "0" + (results[0].duration - Math.floor(results[0].duration / 60) * 60) : (results[0].duration - Math.floor(results[0].duration / 60) * 60));
    
                if (queue.length === 0) playing = false;
    
                if (ytdl.validateURL(music_url)) {
                    queue.push(music_url);
                    queue_title.push(music_title);
                    queue_duration.push(music_duration);
    
                    connection = await message.member.voice.channel.join();
                } else
                    return message.channel.send('Invalid Youtube URL.').then(m => { m.delete({ timeout: 5000 }) });
    
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: `Queue for ${message.guild.name}`,
                    description: `**${queue_title[queue_title.length - 1]} | ${music_duration}** has been added.`
                }}).then(m => { m.delete({ timeout: 5000 }) });
    
                if (!playing) {
                    await this.play(connection, message);
                }
            } else
                return message.channel.send('You must be in a voice channel!').then(m => {
                    m.delete({ timeout: 5000 });
                });
        } catch (error) {
            console.log(error);
        }
	},
	async play(connection, message) {
        const stream = ytdl(queue[0], { filter: 'audioonly' });
        const dispatcher = connection.play(stream, streamOptions);
        playing = true;
        
        dispatcher.on('start', () => {
            console.log(`Now playing ${queue[0]}`);
        });

		dispatcher.on('finish', () => {
			if (looping) {
				setTimeout(() => {
					this.play(connection, message);
				}, 500);
			} else {
				queue.shift();
				queue_title.shift();
				queue_duration.shift();

				if (queue.length === 0) {
					playing = false;
					setTimeout(() => {
						message.member.voice.channel.leave();
					}, 1000 * 60);
				} else {
					setTimeout(() => {
						this.play(connection, message);
					}, 500);
				}
			}
		});
    },
	async loop(message) {
		message.delete({ timeout: 5000 });

		try {
			if (queue.length === 0) return message.channel.send("Can't enable loop. There are no songs on queue.").then(m => { m.delete({ timeout: 5000 }) });

			looping = !looping;

			if (looping)
				message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: `Loop has been enabled. Set to ${queue_title[0]}`,
                }}).then(m => { m.delete({ timeout: 5000 }) });
			else
				message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Loop has been disabled.',
                }}).then(m => { m.delete({ timeout: 5000 }) });
		} catch (error) {
			console.log(error);
		}
	},
	async search(message, args) {
		message.delete({ timeout: 5000 });

		try {
			if (message.member.voice.channel) {
				if (!args[1]) return message.channel.send('Usage: ./search <Youtube query>').then(m => { m.delete({ timeout: 5000 }) });

				searched_music = args.slice(1).join(' ');

                let results = await scrapeYt.search(searched_music, opts_SCRAPE);

                let all_results = '';
                for (const index in results) {
                    all_results += `**${(index + 1)}** - '${results[index].title}\n\n`;
                }                    

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Search results',
                    description: all_results,
                }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
                        
				searching = true;
			} else
				return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
		} catch (error) {
			console.log(error);
		}
	},
	async search_play(message) {
		const option = message.content;
		try {
			if (message.member.voice.channel) {		
                let results = await scrapeYt.search(argsmusic, opts_SCRAPE);
                music_url = results[option - 1].link;
                music_title = results[option - 1].title;
                music_duration = Math.floor(results[option - 1].duration / 60) + ":" + ((results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60) < 10 ? "0" + (results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60) : (results[option - 1].duration - Math.floor(results[option - 1].duration / 60) * 60));				

				if (queue.length === 0) playing = false;

				if (searching) {
					queue.push(music_url);
                    queue_title.push(music_title);
                    queue_duration.push(music_duration);

					let connection = await message.member.voice.channel.join();

					message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: `Queue for ${message.guild.name}`,
                        description: `**${queue_title[queue_title.length - 1]} | ${music_duration}** has been added.`
                    }}).then(m => { m.delete({ timeout: 5000 }) });

					searching = false;

                    if (!playing) 
                        await this.play(connection, message);
				} else return;
			} else return;
		} catch (error) {
			console.log(error);
		}
	},
	async skip(message) {
		message.delete({ timeout: 5000 });

		try {
			queue.shift();
			queue_title.shift();
			queue_duration.shift();

			if (queue.length === 0) return message.member.voice.channel.leave();

			let connection = await message.member.voice.channel.join();

			await this.play(connection, message);
		} catch (error) {
			console.log(error);
		}
	},
	async clear(message) {
		message.delete({ timeout: 5000 });

		queue.length = 0;
		queue_title.length = 0;
		queue_duration.length = 0;

		message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `Updated Queue for ${message.guild.name}`,
            description: `There are **${queue.length}** songs on queue.`,
        }}).then(m => { m.delete({ timeout: 5000 }) });
	},
	async remove(message, args) {
		message.delete({ timeout: 5000 });

		if (!args[1]) return message.channel.send('Usage: ./remove <index>').then(m => { m.delete({ timeout: 5000 }) });
		if (args[1] == 1) return message.channel.send("Can't remove a song that is currently playing.").then(m => { m.delete({ timeout: 5000 }) });

		queue.splice(args[1] - 1, 1);
		queue_title.splice(args[1] - 1, 1);
		queue_duration.splice(args[1] - 1, 1);

        let all_queue = '';
        for (const index in queue_title) {
            all_queue += `**${(index + 1)}** - ${queue_title[index]} | ${queue_duration[index]}\n\n`;
        }			

		message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `Updated queue for ${message.guild.name}`,
            description: all_queue,
        }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
	},
	async queue(message) {
		message.delete({ timeout: 5000 });

		if (queue.length === 0) {
			message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `Queue for ${message.guild.name}`,
                description: 'Nothing has been queued.',
            }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
		} else {
            let all_queue = '';
            for (const index in queue_title) {
                all_queue += `**${(index + 1)}** - ${queue_title[index]} | ${queue_duration[index]}\n\n`;
            }				

			message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `Queue for ${message.guild.name}`,
                description: all_queue,
            }}).then(m => { m.delete({ timeout: 1000 * 60 }) });
		}
	},
	async join(message) {
		message.delete({ timeout: 5000 });

        try {
            if (message.member.voice.channel) {
                playing = false;
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
                playing = false;
                queue.length = 0;
                queue_title.length = 0;
                queue_duration.length = 0;
                await message.member.voice.channel.leave();
            } else return message.channel.send('You must be in a voice channel!').then(m => { m.delete({ timeout: 5000 }) });
        } catch (error) {
            console.log(error);
        }
	}
};
