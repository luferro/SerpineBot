const fetch = require('node-fetch');

module.exports = {
    name: 'github',
    async getGithubRepo(message, args) {
        switch(args[1]) {
            case '-s': {
                message.delete({ timeout: 5000 });

                const repo = args.slice(2).join(' ');

                try {
                    const res = await fetch(`https://api.github.com/search/repositories?q=${repo}&per_page=10`);
                    const data = await res.json();

                    const repositories = [];
                    data.items.forEach(repo => {
                        repositories.push({
                            name: repo.full_name,
                            description: repo.description,
                            url: repo.html_url
                        });
                    });
    
                    message.channel.send({ embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: `Search results for ${argsrepo}`,
                        description: repositories.map(repo => `
                            **${repo.name}**
                            ${repo.url}
                            ${repo.description}
                        `).join('\n')
                    }});   
                } catch (error) {
                    console.log(error);
                }
                break;
            }
            case '-d': {
                message.delete({ timeout: 5000 });

                const repo = args.slice(2).join(' ');

                try {
                    const res = await fetch(`https://api.github.com/search/repositories?q=${repo}&per_page=1`);
                    const data = await res.json();

                    message.channel.send({ embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: `Details found for ${repo}`
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
                    }});
                } catch (error) {
                    console.log(error);
                }
                break;
            }
            default:
                message.channel.send('Usage: ./github <-s or -d> <Repository name>').then(m => { m.delete({ timeout: 5000 }) });
                break;
        }			
    }
}