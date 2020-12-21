const fetch = require('node-fetch');

module.exports = {
    name: 'anime',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        const date = new Date();
        const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

        switch (args[1]) {
            case 'today':
                const today = days[date.getDay()];

                if(args[2] == 'all') {
                    fetch(`https://api.jikan.moe/v3/schedule/${today}`)
                        .then(response => response.json())
                        .then(data => {
                            for (const index in data[today]) {
                                message.author.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    title: data[today][index].title,
                                    url: data[today][index].url,
                                    description: `${data[today][index].synopsis}\n\nAiring: ${data[today][index].airing_start}`,
                                    image: {
                                        url: data[today][index].image_url
                                    }
                                }}).then(m => { m.delete({ timeout: 1000*60*10 }) })
                            }
                        })                                    
                        .catch(error => {
                            console.log(error);
                        });	
                        message.channel.send('Private message with all anime airing today has been sent! These will be deleted in 10 minutes.').then(m => { m.delete({ timeout: 1000*60 }) });
                }
                else {
                    fetch(`https://api.jikan.moe/v3/schedule/${today}`)
                        .then(response => response.json())
                        .then(data => {
                            let random = Math.floor(Math.random() * Object.keys(data[today]).length) + 1;

                            message.channel.send({embed: {
                                color: Math.floor(Math.random() * 16777214) + 1,
                                title: data[today][random].title,
                                url: data[today][random].url,
                                description: `${data[today][random].synopsis}\n\nAiring: ${data[today][random].airing_start}`,
                                image: {
                                    url: data[today][random].image_url
                                }
                            }})
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
                break;
            case 'season':
                if (args[2] == 'all') {
                    fetch(`https://api.jikan.moe/v3/season/${date.getFullYear()}/${args[1]}`)
                        .then(response => response.json())
                        .then(data => {
                            for (const index in data.anime) {
                                message.author.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    title: data.anime[i].title,
                                    url: data.anime[i].url,
                                    description: `${data.anime[i].synopsis}\n\nAiring: ${data.anime[i].airing_start}`,
                                    thumbnail: {
                                        url: data.anime[i].image_url
                                    }
                                }}).then(m => { m.delete({ timeout: 1000*60*10 }) })
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });	
                        message.channel.send(`Private message with all ${args[1]} anime has been sent! These will be deleted in 10 minutes.`).then(m => { m.delete({ timeout: 1000*60 }) });
                }
                else {
                    fetch(`https://api.jikan.moe/v3/season/${date.getFullYear()}/${args[1]}`)
                        .then(response => response.json())
                        .then(data => {
                            let random = Math.floor(Math.random() * Object.keys(data.anime).length) + 1;
                            message.channel.send({embed: {
                                color: Math.floor(Math.random() * 16777214) + 1,
                                title: data.anime[random].title,
                                url: data.anime[random].url,
                                description: `${data.anime[random].synopsis}\n\nAiring: ${data.anime[random].airing_start}`,
                                image: {
                                    url: data.anime[random].image_url
                                }
                            }})
                        })
                        .catch(error => {
                            console.log(error);
                        }); 
                }
                break;
            default:
                message.channel.send('Usage: ./anime <today or season: spring, summer, fall, winter> <optional: all>').then(m => { m.delete({ timeout: 5000 }) });
                break;
        }									
    }
}