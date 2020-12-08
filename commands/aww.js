const fetch = require('node-fetch');

module.exports = {
    name: 'aww',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(args[1]) return message.channel.send('Usage: ./aww').then(m => {m.delete({ timeout: 5000 })});
			
        let subreddit, type = Math.floor((Math.random() * 4) + 1);

        switch (type) {
            case 1:
                subreddit = 'cats';
                break;
            case 2:
                subreddit = 'dogpictures';
                break;
            case 3: 
                subreddit = 'tuckedinkitties';
                break;
            case 4:
                subreddit = 'aww';
                break;
            default:
                break;
        }
        
        fetch(`https://i.reddit.com/r/'${subreddit}/.json?limit=100&restrict_sr=1`)
            .then(response => response.json())
            .then(data => {
                                
                let i = Math.floor(Math.random() * Object.keys(data.data.children).length) + 1;

                if(data.data.children[i].data.is_video == true || data.data.children[i].data.stickied == true || !data.data.children[i].data || data.data.children[i].data.domain != "i.redd.it") i++;
                
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: data.data.children[i].data.title,
                    url: `https://www.reddit.com${data.data.children[i].data.permalink}`,
                    image: {
                        url: data.data.children[i].data.url
                    } 
                }})
            })
            .catch(error => {
                message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            });  		
    }
}