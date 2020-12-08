const fetch = require('node-fetch');

module.exports = {
    name: 'releasing',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        let d = new Date();
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();

        let argsreleasing = args.slice(2).join(' ');

        let new_day, new_month;
        if(day < 10) 
            new_day = '0' + day;
        else 
            new_day = '' + day;
        if(month < 10) 
            new_month = '0' + month;
        else 
            new_month = '' + month;

        switch (args[1]) {
            case '-d':
                if(!argsreleasing) return message.channel.send('Usage: ./releasing <-s> <game title>').then(m => {m.delete({ timeout: 5000 })});

                fetch(`https://api.rawg.io/api/games?dates=${year}-${new_month}-${new_day},${(year+1)}-${new_month}-${new_day}&search=${argsreleasing}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'SerpineBot - Personal use bot for my private discord server'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if((data.results).length > 1 && (data.results[0].name).toLowerCase() != argsreleasing.toLowerCase()) {
                        let search_results = '';
                        for(let i= 0; i < Object.keys(data.results).length; i++) {
                            search_results += `${data.results[i].name}\n\n`;
                        }

                        return message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: "I found the following matches. Try using the full game's name!",
                            description: search_results								
                        }});
                    }

                    let plataformas = '';
                    for(let i= 0; i < Object.keys(data.results[0].platforms).length; i++) {
                        plataformas += `${data.results[0].platforms[i].platform.name}; `;
                    }

                    let tags = '';
                    for(let i= 0; i < Object.keys(data.results[0].tags).length; i++) {
                        if(data.results[0].tags[i].language == 'eng')
                            tags += `${data.results[0].tags[i].name}; `;
                    }

                    let genres = '';
                    for(let i= 0; i < Object.keys(data.results[0].genres).length; i++) {
                        genres += `${data.results[0].genres[i].name}; `;
                    }

                    let release_date = (data.results[0].released).split('-');

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: data.results[0].name,
                        url: `https://rawg.io/games/${data.results[0].slug}`,
                        description: `**Platforms: **${plataformas}\n\n**Tags: **${tags}\n\n**Genres: **${genres}\n\n**Releasing: **${release_date[2]}-${release_date[1]}-${release_date[0]}`,
                        image: {
                            url: data.results[0].background_image
                        }
                    }})
                    .catch(error => {
                        message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                })
                break;
            default:
                if(isNaN(args[1])) return message.channel.send('Usage: ./releasing <month: 1-12>').then(m => {m.delete({ timeout: 5000 })});

                let month_selected = args[1], month_selected_doubledigit;
                if(month_selected < 10) 
                    month_selected_doubledigit = '0' + month_selected;
                else 
                    month_selected_doubledigit = month_selected;
    
                let firstDay = new Date(year, month_selected, 1).getDate();
                let lastDay = new Date(year, month_selected, 0).getDate();
    
                let firstDay_doubledigit;
                if(firstDay < 10) 
                    firstDay_doubledigit = '0' + firstDay;
                else 
                    firstDay_doubledigit = firstDay;
                
                fetch(`https://api.rawg.io/api/games?dates=${year}-${month_selected_doubledigit}-${firstDay_doubledigit},${year}-${month_selected_doubledigit}-${lastDay}&ordering=-added`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'User-Agent': 'SerpineBot - Personal use bot for my private discord server'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        let month_results = '';
                        for(let i= 0; i < Object.keys(data.results).length; i++) {
                            let release_date = (data.results[i].released).split('-');
                            month_results += `${data.results[i].name}\n**Releasing: **${release_date[2]}-${release_date[1]}-${release_date[0]}\n\n`;
                        }
    
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'These are the top 20 games releasing',
                            description: month_results							
                        }})
                    .catch(error => {
                        message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                }) 
                break;
        }
    }
}