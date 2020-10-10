const fetch = require('node-fetch');

module.exports = {
    name: 'reviews',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        switch (args[1]) {
            case '-d':
                let argsgames = args.slice(2).join(" ");

                fetch('https://i.reddit.com/r/Games/search.json?q='+argsgames+' %22Review%20Thread%22&restrict_sr=1')
                .then(response => response.json())
                .then(function(data) {
                    let selftextReviews = (data.data.children[0].data.selftext).split("\n"), OpenCriticScore;
                    
                    for(let j = 0; j < selftextReviews.length; j++){
                        if(selftextReviews[j].search("OpenCritic") != -1) OpenCriticScore = selftextReviews[j];
                    }

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: data.data.children[0].data.title,
                        url: data.data.children[0].data.url,
                        description: OpenCriticScore
                    }});
                })
                break;        
            default:
                fetch('https://i.reddit.com/r/Games/search.json?q=%22Review%20Thread%22&limit=100&sort=new&restrict_sr=1')
                .then(response => response.json())
                .then(function(data) {
                    let reviewedgames = '';
                    for(let i= 0; i < 10; i++) {
                        reviewedgames += data.data.children[i].data.title+"\n\n";
                    }

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Last 10 reviewed games were:",
                        description: reviewedgames
                    }});
                })		
                break;
        }			
    }
}