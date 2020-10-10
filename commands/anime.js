const fetch = require('node-fetch');

module.exports = {
    name: 'anime',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send('Usage: ./anime <today or season: spring, summer, fall, winter> <optional: all>').then(m => {m.delete({ timeout: 5000 })});

        let d = new Date();

        switch (args[1]) {
            case 'today':
                let days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                let today = days[d.getDay()];

                switch (args[2]) {
                    case 'all':
                        fetch('https://api.jikan.moe/v3/schedule/'+today)
                            .then(response => response.json())
                            .then(function(data) {
                                for(let i= 0; i < Object.keys(data[today]).length; i++) {
                                    message.author.send({embed: {
                                        color: Math.floor(Math.random() * 16777214) + 1,
                                        title: data[today][i].title,
                                        url: data[today][i].url,
                                        description: data[today][i].synopsis+'\n\n'+"Airing: "+data[today][i].airing_start,
                                        image: {
                                            url: data[today][i].image_url
                                        }
                                    }}).then(m => {m.delete({ timeout: 1000*60*5 })})
                                    .catch(function(error) {
                                        message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                                        console.log(error);
                                    });
                                }
                            })	
                        message.channel.send("Private message with all anime airing today has been sent! These will be deleted in 5 minutes.").then(m => {m.delete({ timeout: 10000 })});
                        break;
                    default:
                        fetch('https://api.jikan.moe/v3/schedule/'+today)
                            .then(response => response.json())
                            .then(function(data) {
                                let i = Math.floor(Math.random() * Object.keys(data[today]).length) + 1;

                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    title: data[today][i].title,
                                    url: data[today][i].url,
                                    description: data[today][i].synopsis+'\n\n'+"Airing: "+data[today][i].airing_start,
                                    image: {
                                        url: data[today][i].image_url
                                    }
                                }})
                                .catch(function(error) {
                                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                                    console.log(error);
                                });
                            })
                        break;
                }
                break;
            default:
                let year = d.getFullYear();
                switch (args[2]) {
                    case 'all':
                        fetch('https://api.jikan.moe/v3/season/'+year+'/'+args[1])
                            .then(response => response.json())
                            .then(function(data) {
                                for(let i= 0; i < Object.keys(data.anime).length; i++) {
                                    message.author.send({embed: {
                                        color: Math.floor(Math.random() * 16777214) + 1,
                                        title: data.anime[i].title,
                                        url: data.anime[i].url,
                                        description: data.anime[i].synopsis+'\n\n'+"Airing: "+data.anime[i].airing_start,
                                        thumbnail: {
                                            url: data.anime[i].image_url
                                        }
                                    }}).then(m => {m.delete({ timeout: 1000*60*10 })})
                                    .catch(function(error) {
                                        message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                                        console.log(error);
                                    });
                                }
                            })	
                        message.channel.send("Private message with all "+args[1]+" anime has been sent! These will be deleted in 10 minutes.").then(m => {m.delete({ timeout: 10000 })});
                        break;
                    default:
                        fetch('https://api.jikan.moe/v3/season/'+year+'/'+args[1])
                            .then(response => response.json())
                            .then(function(data) {
                                let i = Math.floor(Math.random() * Object.keys(data.anime).length) + 1;
                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    title: data.anime[i].title,
                                    url: data.anime[i].url,
                                    description: data.anime[i].synopsis+'\n\n'+"Airing: "+data.anime[i].airing_start,
                                    image: {
                                        url: data.anime[i].image_url
                                    }
                                }})
                                .catch(function(error) {
                                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                                    console.log(error);
                                }); 
                            })
                        break;
                }
                break;
        }									
    }
}