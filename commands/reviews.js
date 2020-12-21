const fetch = require('node-fetch');

module.exports = {
    name: 'reviews',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(args[1]) {
            let argsgames = args.slice(2).join(' ');

            fetch(`https://www.reddit.com/r/Games/search.json?q=flair_name%3A%22Review%20Thread%22${argsgames}&restrict_sr=1&sort=new&limit=1`)
                .then(response => response.json())
                .then(data => {
                    let selftextReviews = (data.data.children[0].data.selftext).split('\n'), OpenCriticScore;
                    
                    for(let j = 0; j < selftextReviews.length; j++){
                        if(selftextReviews[j].search('OpenCritic') != -1) OpenCriticScore = selftextReviews[j];
                    }

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: data.data.children[0].data.title,
                        url: data.data.children[0].data.url,
                        description: OpenCriticScore
                    }})
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            fetch('https://www.reddit.com/r/Games/search.json?q=flair_name%3A%22Review%20Thread%22&restrict_sr=1&sort=new&limit=10')
                .then(response => response.json())
                .then(data => {
                    let last10ReviewedGames = [];
                    data.data.children.forEach(review => {
                        last10ReviewedGames.push(review.data.title)
                    });
                    
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: 'Last 10 reviewed games',
                        description: last10ReviewedGames.join('\n\n')
                    }})
                })		
                .catch(error => {
                    console.log(error);
                });
        }			
    }
}