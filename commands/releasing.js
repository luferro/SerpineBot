const fetch = require('node-fetch');

module.exports = {
    name: 'releasing',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        let argsreleasing = args.slice(1).join(' ');

        const date = new Date();
        let day = date.getDate().toString().padStart(2, "0");
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let year = date.getFullYear();

        if (!argsreleasing) return message.channel.send('Usage: ./releasing <game title> or ./releasing <month: 1-12>').then(m => {m.delete({ timeout: 5000 })});

        if (/^\d*\d$/g.test(argsreleasing)) {
            if (argsreleasing < 0 || argsreleasing > 12) return message.channel.send('Usage: ./releasing <month: 1-12>').then(m => {m.delete({ timeout: 5000 })});

            let argsmonth = argsreleasing < 10 ? '0' + argsreleasing : argsreleasing;
            let firstDayinMonth = new Date(year, argsmonth, 1).getDate().toString().padStart(2, "0");
            let lastDayinMonth = new Date(year, argsmonth, 0).getDate().toString().padStart(2, "0"); 
         
            fetch(`https://api.rawg.io/api/games?dates=${year}-${argsmonth}-${firstDayinMonth},${year}-${argsmonth}-${lastDayinMonth}&page_size=10&ordering=-added`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'SerpineBot - Personal use bot for my private discord server'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    let titles = [];
                    data.results.forEach(element => {
                        titles.push({
                            title: element.name,
                            date: element.released
                        });
                    });

                    titles.sort((a, b) => new Date(a.date) - new Date(b.date));
            
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: 'These are the top 10 games releasing',
                        description: titles.map(game => `
                            **${game.title}**
                            **Releasing:** ${game.date.split('-')[2]}-${game.date.split('-')[1]}-${game.date.split('-')[0]}
                        `).join('\n')							
                    }})
                .catch(error => {
                    console.log(error);
                });
            }) 
        }
        else {
            fetch(`https://api.rawg.io/api/games?dates=${year}-${month}-${day},${(year+2)}-${month}-${day}&search=${argsreleasing}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'SerpineBot - Personal use bot for my private discord server'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if(data.count == 0) return message.channel.send('No results were found.').then(m => {m.delete({ timeout: 5000 })});

                    let platforms = [];
                    data.results[0].platforms.forEach(element => {
                        platforms.push(element.platform.name);
                    });

                    let tags = [];
                    data.results[0].tags.forEach(element => {
                        element.language == 'eng' && tags.push(element.name);
                    });

                    let genres = [];
                    data.results[0].genres.forEach(element => {
                        genres.push(element.name);
                    });

                    let releaseDate = (data.results[0].released).split('-');

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: data.results[0].name,
                        url: `https://rawg.io/games/${data.results[0].slug}`,
                        description: `
                            ${platforms.length > 0 ? `**Platforms:**\n${platforms.join('\n')}` : ''}
                            \n${tags.length > 0 ? `**Tags:**\n${tags.join('; ')}` : ''}
                            \n${genres.length > 0 ? `**Genres:**\n${genres.join('; ')}` : ''}
                            \n**Releasing:** ${releaseDate[2]}-${releaseDate[1]}-${releaseDate[0]}
                        `,
                        image: {
                            url: data.results[0].background_image
                        }
                    }})
                    .catch(error => {
                        console.log(error);
                    });
                })
        }
    }
}