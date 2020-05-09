const fetch = require('node-fetch');

module.exports = {
    name: 'github',
    async execute(message, args){
        switch(args[1]) {
            case '-s':
                message.delete({ timeout: 5000 });
                
                var argsrepo = args.slice(2).join(" ");

                fetch('https://api.github.com/search/repositories?q=' + argsrepo)
                .then(response => response.json())
                .then(function(data) {
                    var tam = 10;
                    if((data.items).length < 10)
                        tam = (data.items).length;

                    var all_results = '';
                    for(var i = 0; i < tam; i++) {
                        all_results += data.items[i].full_name + '\n\n';
                    }

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Search results for " + argsrepo,
                        description: all_results
                    }})
                    .catch(function(error) {
                        message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                })
            break;
            case '-d':
                message.delete({ timeout: 5000 });
                
                var argsrepo = args.slice(2).join(" ");

                fetch('https://api.github.com/search/repositories?q=' + argsrepo)
                .then(response => response.json())
                .then(function(data) {
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: "Details found for " + argsrepo
                        },
                        title: data.items[0].full_name,
                        url: data.items[0].html_url,
                        description: data.items[0].description,
                        fields: [
                            {
                                name: "**Language**",
                                value: data.items[0].language,
                                inline: true
                            },
                            {
                                name: "**Created at**",
                                value: data.items[0].created_at,
                                inline: true
                            },
                            {
                                name: "**Updated at**",
                                value: data.items[0].updated_at,
                                inline: true
                            }
                        ]
                    }})
                    .catch(function(error) {
                        message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                })
            break;
            default:
                message.channel.send('Usage: ./github <-s or -d> repository_name').then(m => {m.delete({ timeout: 5000 })});
        }			
    }
}