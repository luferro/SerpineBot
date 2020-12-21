const fetch = require('node-fetch');

module.exports = {
    name: 'memes',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(args[1]) return message.channel.send('Usage: ./memes').then(m => {m.delete({ timeout: 5000 })});
			
        let subreddit, type = Math.floor((Math.random() * 2) + 1);

        if(type === 1) subreddit = 'memes';
        else subreddit = 'dankmemes';
        
        fetch(`https://i.reddit.com/r/${subreddit}/.json?limit=100&restrict_sr=1`)
            .then(response => response.json())
            .then(data => {     
                let random = Math.floor(Math.random() * Object.keys(data.data.children).length) + 1;
                
                if(data.data.children[random].data.stickied == true || !data.data.children[random].data) random++;
                
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: data.data.children[random].data.title,
                    url: `https://www.reddit.com${data.data.children[random].data.permalink}`,
                    image: {
                        url: data.data.children[random].data.url
                    } 
                }})
            })	
            .catch(error => {
                console.log(error);
            });      					
    }
}