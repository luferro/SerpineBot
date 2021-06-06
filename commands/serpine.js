const fetch = require('node-fetch');

module.exports = {
    name: 'serpine',
    async getAuthorRepos(message) {
        message.delete({ timeout: 5000 });

        try {
            const res_user = await fetch('https://api.github.com/users/xSerpine');
            const user = await res_user.json();

            const res_repos = await fetch('https://api.github.com/users/xSerpine/repos');
            const data = await res_repos.json();

            const repos = [];
            data.forEach(repo => {
                repos.push({
                    name: repo.name,
                    description: repo.description ? repo.description : 'No description available.'
                });
            });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: user.name,
                url: user.html_url,
                description: repos.map(repo => `**${repo.name}** - ${repo.description}`).join('\n\n'),
                thumbnail: {
                    url: user.avatar_url
                } 
            }});
        } catch (error) {
            console.log(error);
        }        
    }
}