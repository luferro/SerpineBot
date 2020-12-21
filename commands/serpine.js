const fetch = require('node-fetch');

module.exports = {
    name: 'serpine',
    async execute(message){
        message.delete({ timeout: 5000 });

        fetch('https://api.github.com/users/xSerpine')
            .then(response => response.json())
            .then(user => {
                fetch('https://api.github.com/users/xSerpine/repos')
                    .then(response => response.json())
                    .then(data => {
                        let repos = [];
                        data.forEach(repo => {
                            repos.push({
                                name: repo.name,
                                description: repo.description ? repo.description : 'No description available.'
                            });
                        });

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: user.name,
                            url: user.html_url,
                            description: repos.map(repo => `**${repo.name}** - ${repo.description}`).join('\n\n'),
                            thumbnail: {
                                url: user.avatar_url
                            } 
                        }})
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            }); 				
    }
}