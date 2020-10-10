const scrapeYt = require("scrape-yt");
const search = require('youtube-search');
const ytdl = require('ytdl-core');

const opts_YTAPI = {
    maxResults: 10,
    key: process.env.YTKEY,
    type: 'video'
};
const opts_SCRAPE = {
    limit: 20
};
const streamOptions = {
    seek: 0,
    volume: 1
};

var queue = [], queue_title = [], queue_duration = [], playing = true, looping = false, searching = false, searched_music = "";

module.exports = {
    name: 'music',
    async execute(message, args){
        message.delete({ timeout: 5000 }); 

        let connection, argsmusic = args.slice(1).join(" "), music_url, music_title, music_duration, array_titles = [], array_id = [], array_duration = [];
        
        let results_scrape = await scrapeYt.search(argsmusic, opts_SCRAPE).catch(err => console.log(err));

        for(let i = 0; i < results_scrape.length; i++) {
            if(results_scrape[i].title != undefined) {
                array_titles.push(results_scrape[i].title);
                array_id.push(results_scrape[i].id)
                array_duration.push(results_scrape[i].duration);
            }
        }

        if(array_titles.length > 0) {  //Youtube Scrape
            music_url = "https://www.youtube.com/watch?v=" + array_id[0];
            music_title = array_titles[0];
            music_duration = Math.floor(array_duration[0] / 60) + ":" + ((array_duration[0] - Math.floor(array_duration[0] / 60) * 60) < 10 ? "0" + (array_duration[0] - Math.floor(array_duration[0] / 60) * 60) : (array_duration[0] - Math.floor(array_duration[0] / 60) * 60));
        }
        else {  //Youtube API
            let results = await search(argsmusic, opts_YTAPI).catch(err => console.log(err));
            music_url = results.results[0].link;
            music_title = results.results[0].title;
        }

        if (message.member.voice.channel) {
            if(!args[1]) return message.channel.send("Usage: ./play <Youtube query>").then(m => {m.delete({ timeout: 5000 })});

            if(queue.length === 0) playing = false;

            if(ytdl.validateURL(music_url)) {
                queue.push(music_url);
                queue_title.push(music_title);
                music_duration ? queue_duration.push(music_duration) : queue_duration.push("N/A");

                connection = await message.member.voice.channel.join();
            } else {
                return message.channel.send("Invalid Youtube URL.").then(m => {m.delete({ timeout: 5000 })});
            }

            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Queue for " + message.guild.name,
                description: music_duration ? "**" + queue_title[queue_title.length - 1] + " | " + music_duration + "** has been added." :  "**" + queue_title[queue_title.length - 1] + "** has been added."
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

        if(queue.length === 0) return message.channel.send("Can't enable loop. There are no songs on queue.").then(m => {m.delete({ timeout: 5000 })});

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

        let argsmusic = args.slice(1).join(" "), array_titles = [], array_duration = [];

        searched_music = argsmusic;

        if (message.member.voice.channel) {
            if(!args[1]) return message.channel.send("Usage: ./search <Youtube query>").then(m => {m.delete({ timeout: 5000 })});
            
            let results_scrape = await scrapeYt.search(argsmusic, opts_SCRAPE).catch(err => console.log(err));

            for(let i = 0; i < results_scrape.length; i++) {
                if(results_scrape[i].title != undefined) {
                    array_titles.push(results_scrape[i].title);
                    array_duration.push(results_scrape[i].duration);
                }
            }

            if(array_titles.length > 0) {  //Youtube Scrape
                let all_results = '';
                for(let i = 0; i < 10; i++) {
                    all_results += "**" + (i+1) + "** - " + array_titles[i] + " | " + (Math.floor(array_duration[i] / 60) + ":" + (array_duration[i] - Math.floor(array_duration[i] / 60) * 60)) + '\n\n';
                }
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Search results",
                    description: all_results
                }}).then(m => {m.delete({ timeout: 1000*60 })});

            }
            else {  //Youtube API
                let results = await search(argsmusic, opts_YTAPI).catch(err => console.log(err));
                let all_results = '';
                for(let i = 0; i < results.results.length; i++)
                    all_results += "**" + (i+1) + "** - " + results.results[i].title + '\n\n';

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Search results",
                    description: all_results
                }}).then(m => {m.delete({ timeout: 1000*60 })}); 
            }

            searching = true;
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    },
    async search_play(message, option){
        let results_scrape = await scrapeYt.search(searched_music, opts_SCRAPE).catch(err => console.log(err)), array_titles = [], array_id = [], array_duration = [];;

        for(let i = 0; i < results_scrape.length; i++) {
            if(results_scrape[i].title != undefined) {
                array_titles.push(results_scrape[i].title);
                array_id.push(results_scrape[i].id);
                array_duration.push(results_scrape[i].duration);
            }
        }

        if(results_scrape.length > 0) {  //Youtube Scrape
            music_url = "https://www.youtube.com/watch?v=" + array_id[option-1];
            music_title = array_titles[option-1];
            music_duration = Math.floor(array_duration[option-1] / 60) + ":" + (array_duration[option-1] - Math.floor(array_duration[option-1] / 60) * 60);
        }
        else {  //Youtube API
            let results = await search(searched_music, opts_YTAPI).catch(err => console.log(err));
            music_url = results.results[option-1].link;
            music_title = results.results[option-1].title;
        }

        if (message.member.voice.channel) {
            if(queue.length === 0) playing = false;

            if(searching) {
                queue.push(music_url);
                queue_title.push(music_title);
                music_duration ? queue_duration.push(music_duration) : queue_duration.push("N/A");

                let connection = await message.member.voice.channel.join();

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Queue for " + message.guild.name,
                    description: music_duration ? "**" + queue_title[queue_title.length - 1] + " | " + music_duration + "** has been added." :  "**" + queue_title[queue_title.length - 1] + "** has been added."
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

        if(queue.length === 0)
            return message.member.voice.channel.leave();

        let connection = await message.member.voice.channel.join();

        this.play(connection, message, queue);
    },
    async clear(message, args){
        message.delete({ timeout: 5000 });

        queue.length = 0;
        queue_title.length = 0;

        message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: "Updated Queue for " + message.guild.name,
            description: "There are **" + queue.length + "** songs on queue."
        }}).then(m => {m.delete({ timeout: 5000 })});
    },
    async remove(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send("Usage: ./remove <index>").then(m => {m.delete({ timeout: 5000 })});

        if(args[1] == 1) return message.channel.send("Can't remove a song that is currently playing.").then(m => {m.delete({ timeout: 5000 })});

        queue.splice(args[1] - 1, 1);
        queue_title.splice(args[1] - 1, 1);

        let all_queue = '';
        for(let i = 0; i < queue_title.length; i++)
            queue_duration[i] !== "N/A" ? all_queue += "**" + (i+1) + "** - " + queue_title[i] + " | " + queue_duration[i] + '\n\n' : all_queue += "**" + (i+1) + "** - " + queue_title[i] + '\n\n';
                    
        message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: "Updated queue for " + message.guild.name,
            description: all_queue
        }}).then(m => {m.delete({ timeout: 1000*60 })});
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
            let all_queue = '';
            for(let i = 0; i < queue_title.length; i++)
                queue_duration[i] !== "N/A" ? all_queue += "**" + (i+1) + "** - " + queue_title[i] + " | " + queue_duration[i] + '\n\n' : all_queue += "**" + (i+1) + "** - " + queue_title[i] + '\n\n';
                        
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