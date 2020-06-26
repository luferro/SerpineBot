const fetch = require('node-fetch');

module.exports = {
    name: 'serpine',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        fetch('https://api.github.com/users/xSerpine')
        .then(response => response.json())
        .then(function(user) {

            fetch('https://api.github.com/users/xSerpine/repos')
            .then(response => response.json())
            .then(function(data) {

                var tam = 10;
                if(data.length < tam)
                    tam = data.length;

                var repos = '';
                for(var i = 0; i < tam; i++) {
                    var desc = data[i].description;
                    if(!data[i].description) desc = 'No description available.'
                    repos += '**' + data[i].name + '**\n' + desc + '\n\n';
                }

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: user.name,
                    url: user.html_url,
                    description: repos,
                    thumbnail: {
                        url: user.avatar_url
                    } 
                }})
                .catch(function(error) {
                    message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });
            })
            .catch(function(error) {
                message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            }); 
        })				
    }
}