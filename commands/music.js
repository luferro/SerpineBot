const search = require('youtube-search');
const opts = {
    maxResults: 1,
    key: process.env.YTKEY,
    type: 'video'
};
const opts_search = {
    maxResults: 10,
    key: process.env.YTKEY,
    type: 'video'
};
const ytdl = require('ytdl-core');
const streamOptions = {
    seek: 0,
    volume: 1
};

var queue = [], queue_title = [], playing = true, looping = false, searching = false, searched_music = "";

module.exports = {
    name: 'music',
    async execute(message, args){
        message.delete({ timeout: 5000 }); 

        let connection, argsmusic = args.slice(1).join(" ");

        let results = await search(argsmusic, opts).catch(err => console.log(err));

        if (message.member.voice.channel) {
            if(!args[1]) return message.channel.send("Usage: ./play <Youtube query>").then(m => {m.delete({ timeout: 5000 })});

            if(queue.length === 0) playing = false;

            if(ytdl.validateURL(results.results[0].link)) {
                queue.push(results.results[0].link);
                queue_title.push(results.results[0].title);

                connection = await message.member.voice.channel.join();
            } else {
                return message.channel.send("Invalid Youtube URL.").then(m => {m.delete({ timeout: 5000 })});
            }

            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Queue for " + message.guild.name,
                description: "**" + queue_title[queue_title.length - 1] + "** has been added."
            }}).then(m => {m.delete({ timeout: 5000 })});

            if(playing === false) {
                await this.play(connection, message);
            }
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    },
    async play(connection, message) {
        stream = ytdl(queue[0], {filter: "audioonly"});

        const dispatcher = connection.play(stream, streamOptions);

        playing = true;

        dispatcher.on('finish', () => {
            if(looping) {
                setTimeout(() => {
                    this.play(connection, message);
                }, 500)
            } 
            else {
                queue.shift();
                queue_title.shift();
                if(queue.length === 0) {
                    playing = false;
                    setTimeout(() => {
                        message.member.voice.channel.leave();
                    }, 1000*60)
                }
                else {
                    setTimeout(() => {
                        this.play(connection, message);
                    }, 500)
                }
            }
        });
    },
    async loop(message, args){
        message.delete({ timeout: 5000 });

        looping = !looping;

        if(looping) 
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Loop has been enabled. Set to " + queue_title[0],
            }}).then(m => {m.delete({ timeout: 5000 })});
        else
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Loop has been disabled.",
            }}).then(m => {m.delete({ timeout: 5000 })});
    },
    async search(message, args){
        message.delete({ timeout: 5000 }); 

        let argsmusic = args.slice(1).join(" ");

        searched_music = argsmusic;

        let results = await search(argsmusic, opts_search).catch(err => console.log(err));

        if (message.member.voice.channel) {
            if(!args[1]) return message.channel.send("Usage: ./search <Youtube query>").then(m => {m.delete({ timeout: 5000 })});

            var all_results = '';
            for(var i = 0; i < results.results.length; i++)
            all_results += "**" + (i+1) + "** - " + results.results[i].title + '\n\n';

            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Search results",
                description: all_results
            }}).then(m => {m.delete({ timeout: 1000*60 })});

            searching = true;
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    },
    async search_play(message, option){
        let results = await search(searched_music, opts_search).catch(err => console.log(err));

        if (message.member.voice.channel) {
            if(queue.length === 0) playing = false;

            if(searching) {
                queue.push(results.results[option-1].link);
                queue_title.push(results.results[option-1].title);

                let connection = await message.member.voice.channel.join();

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Queue for " + message.guild.name,
                    description: "**" + queue_title[queue_title.length - 1] + "** has been added."
                }}).then(m => {m.delete({ timeout: 5000 })});

                searching = false;

                if(playing === false) {
                    await this.play(connection, message);
                }
            }
            else return;
        }
        else return;
    },
    async skip(message, args){
        message.delete({ timeout: 5000 });
			
        queue.shift();
        queue_title.shift();

        let connection = await message.member.voice.channel.join();

        this.play(connection, message, queue);
    },
    async clear(message, args){
        message.delete({ timeout: 5000 });

        queue.length = 0;
        queue_title.length = 0;

        message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: "Queue for " + message.guild.name,
            description: "There are **" + queue.length + "** songs on queue."
        }}).then(m => {m.delete({ timeout: 5000 })});
    },
    async remove(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send("Usage: ./remove <index>").then(m => {m.delete({ timeout: 5000 })});

        queue.splice(args[1] - 1, 1);
        queue_title.splice(args[1] - 1, 1);
    },
    async queue(message, args){
        message.delete({ timeout: 5000 });

        if(queue.length === 0) {
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Queue for " + message.guild.name,
                description: "Nothing has been queued."
            }}).then(m => {m.delete({ timeout: 1000*60 })});
        }
        else {
            var all_queue = '';
            for(var i = 0; i < queue_title.length; i++)
                all_queue += "**" + (i+1) + "** - " + queue_title[i] + '\n\n';
                        
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Queue for " + message.guild.name,
                description: all_queue
            }}).then(m => {m.delete({ timeout: 1000*60 })});
        }
    },
    async join(message, args){
        message.delete({ timeout: 5000 });
		
        if (message.member.voice.channel) {
            playing = false;
            await message.member.voice.channel.join();
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    },
    async leave(message, args){
        message.delete({ timeout: 5000 });
		
        if (message.member.voice.channel) {
            playing = false;
            queue.length = 0;
            queue_title.length = 0;
            await message.member.voice.channel.leave();
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    }
}