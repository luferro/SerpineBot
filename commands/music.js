const scrapeYt = require("scrape-yt");
const search = require('youtube-search');
const ytdl = require('ytdl-core');

const opts_YTAPI = {
    maxResults: 10,
    key: process.env.YTKEY,
    type: 'video'
};
const opts_SCRAPE = {
    limit: 20,
    type: 'video'
};
const streamOptions = {
    seek: 0,
    volume: 1
};

let queue = [], queue_title = [], queue_duration = [], playing = true, looping = false, searching = false, searched_music = "";

module.exports = {
    name: 'music',
    async execute(message, args){
        message.delete({ timeout: 5000 }); 

        let connection, argsmusic = args.slice(1).join(" "), music_url, music_title, music_duration;

        if (message.member.voice.channel) {
            let results_scrape = await scrapeYt.search(argsmusic, opts_SCRAPE).catch(err => console.log(err));
            if(results_scrape) {  //Youtube Scrape
                music_url = "https://www.youtube.com/watch?v=" + results_scrape[0].id;
                music_title = results_scrape[0].title;
                music_duration = Math.floor(results_scrape[0].duration / 60) + ":" + ((results_scrape[0].duration - Math.floor(results_scrape[0].duration / 60) * 60) < 10 ? "0" + (results_scrape[0].duration - Math.floor(results_scrape[0].duration / 60) * 60) : (results_scrape[0].duration - Math.floor(results_scrape[0].duration / 60) * 60));
            }
            else {  //Youtube API
                let results = await search(argsmusic, opts_YTAPI).catch(err => console.log(err));
                music_url = results.results[0].link;
                music_title = results.results[0].title;
                music_duration = null;
            }

            if(!args[1]) return message.channel.send("Usage: ./play <Youtube query>").then(m => {m.delete({ timeout: 5000 })});

            if(queue.length === 0) playing = false;

            if(ytdl.validateURL(music_url)) {
                queue.push(music_url);
                queue_title.push(music_title);
                music_duration ? queue_duration.push(music_duration) : queue_duration.push("N/A");

                connection = await message.member.voice.channel.join();
            } else return message.channel.send("Invalid Youtube URL.").then(m => {m.delete({ timeout: 5000 })});

            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Queue for " + message.guild.name,
                description: music_duration ? "**" + queue_title[queue_title.length - 1] + " | " + music_duration + "** has been added." :  "**" + queue_title[queue_title.length - 1] + "** has been added."
            }}).then(m => {m.delete({ timeout: 5000 })});

            if(!playing) {
                await this.play(connection, message);
            }
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});   
    },
    async play(connection, message) {
        const stream = ytdl(queue[0], {filter: "audioonly"});
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
                queue_duration.shift();

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
    async loop(message){
        message.delete({ timeout: 5000 });

        try {
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
        } catch (error) {
            console.log(error)
        }
    },
    async search(message, args){
        message.delete({ timeout: 5000 }); 

        try {    
            if (message.member.voice.channel) {
                if(!args[1]) return message.channel.send("Usage: ./search <Youtube query>").then(m => {m.delete({ timeout: 5000 })});
                
                searched_music = args.slice(1).join(" ");

                let results_scrape = await scrapeYt.search(searched_music, opts_SCRAPE).catch(err => console.log(err));
    
                if(results_scrape) {  //Youtube Scrape
                    let all_results = '';
                    for(let i = 0; i < 10; i++) {
                        all_results += "**" + (i+1) + "** - " + results_scrape[i].title + " | " + (Math.floor(results_scrape[i].duration / 60) + ":" + (results_scrape[i].duration - Math.floor(results_scrape[i].duration / 60) * 60)) + '\n\n';
                    }
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Search results",
                        description: all_results
                    }}).then(m => {m.delete({ timeout: 1000*60 })});
                }
                else {  //Youtube API
                    let results = await search(searched_music, opts_YTAPI).catch(err => console.log(err));
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
        } catch (error) {
            console.log(error)
        }
    },
    async search_play(message, option){
        try {    
            if (message.member.voice.channel) {
                let results_scrape = await scrapeYt.search(searched_music, opts_SCRAPE).catch(err => console.log(err));
    
                if(results_scrape) {    //Youtube Scrape            
                    music_url = "https://www.youtube.com/watch?v=" + results_scrape[option-1].id;
                    music_title = results_scrape[option-1].title;
                    music_duration = Math.floor(results_scrape[option-1].duration / 60) + ":" + (results_scrape[option-1].duration - Math.floor(results_scrape[option-1].duration / 60) * 60);
                }
                else {  //Youtube API
                    let results = await search(searched_music, opts_YTAPI).catch(err => console.log(err));
                    music_url = results.results[option-1].link;
                    music_title = results.results[option-1].title;
                }

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
    
                    if(!playing) await this.play(connection, message);
                }
                else return;
            }
            else return;   
        } catch (error) {
            console.log(error);
        }
    },
    async skip(message){
        message.delete({ timeout: 5000 });

        try {
            queue.shift();
            queue_title.shift();
            queue_duration.shift();
    
            if(queue.length === 0) return message.member.voice.channel.leave();  
    
            let connection = await message.member.voice.channel.join();
    
            await this.play(connection, message);   
        } catch (error) {
            console.log(error)
        }
    },
    async clear(message){
        message.delete({ timeout: 5000 });

        queue.length = 0;
        queue_title.length = 0;
        queue_duration.length = 0;

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
        queue_duration.splice(args[1] - 1, 1);

        let all_queue = '';
        for(let i = 0; i < queue_title.length; i++)
            queue_duration[i] !== "N/A" ? all_queue += "**" + (i+1) + "** - " + queue_title[i] + " | " + queue_duration[i] + '\n\n' : all_queue += "**" + (i+1) + "** - " + queue_title[i] + '\n\n';
                    
        message.channel.send({embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: "Updated queue for " + message.guild.name,
            description: all_queue
        }}).then(m => {m.delete({ timeout: 1000*60 })});
    },
    async queue(message){
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
    async join(message){
        message.delete({ timeout: 5000 });
		
        if (message.member.voice.channel) {
            playing = false;
            await message.member.voice.channel.join();
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    },
    async leave(message){
        message.delete({ timeout: 5000 });
		
        if (message.member.voice.channel) {
            playing = false;
            queue.length = 0;
            queue_title.length = 0;
            queue_duration.length = 0;
            await message.member.voice.channel.leave();
        }
        else return message.channel.send("You must be in a voice channel!").then(m => {m.delete({ timeout: 5000 })});
    }
}