const fetch = require('node-fetch');

module.exports = {
    name: 'github',
    async execute(message, args){
        let argsrepo = args.slice(2).join(' ');

        switch(args[1]) {
            case '-s':
                message.delete({ timeout: 5000 });

                fetch(`https://api.github.com/search/repositories?q=${argsrepo}&per_page=10`)
                    .then(response => response.json())
                    .then(data => {
                        let repositories = [];
                        data.items.forEach(repo => {
                            repositories.push({
                                name: repo.full_name,
                                description: repo.description,
                                url: repo.html_url
                            })
                        });

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: `Search results for ${argsrepo}`,
                            description: repositories.map(repo => `
                                **${repo.name}**
                                ${repo.url}
                                ${repo.description}
                            `).join('\n')
                        }})
                    })
                    .catch(error => {
                        message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                break;
            case '-d':
                message.delete({ timeout: 5000 });

                fetch(`https://api.github.com/search/repositories?q=${argsrepo}&per_page=1`)
                    .then(response => response.json())
                    .then(data => {
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            author: {
                                name: `Details found for ${argsrepo}`
                            },
                            title: data.items[0].full_name,
                            url: data.items[0].html_url,
                            description: data.items[0].description,
                            fields: [
                                {
                                    name: '**Language**',
                                    value: data.items[0].language,
                                    inline: true
                                },
                                {
                                    name: '**Created at**',
                                    value: data.items[0].created_at,
                                    inline: true
                                },
                                {
                                    name: '**Updated at**',
                                    value: data.items[0].updated_at,
                                    inline: true
                                }
                            ]
                        }})
                        .catch(error => {
                            console.log(error);
                        });
                    })
                break;
            default:
                message.channel.send('Usage: ./github <-s or -d> repository_name').then(m => {m.delete({ timeout: 5000 })});
                break;
        }			
    }
}