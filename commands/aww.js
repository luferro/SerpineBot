const fetch = require('node-fetch');

module.exports = {
    name: 'aww',
    async getCutePosts(message, args) {
        message.delete({ timeout: 5000 });

        if(args[1]) return message.channel.send('Usage: ./aww').then(m => { m.delete({ timeout: 5000 }) });

        const subreddits = ['aww', 'tuckedinkitties', 'dogpictures', 'catpictures', 'rarepuppers'];
        const type = Math.floor(Math.random() * (subreddits.length - 1));
        
        try {
            const res = await fetch(`https://www.reddit.com/r/${subreddits[type]}/.json?limit=100&restrict_sr=1`);
            const data = await res.json();

            const random = Math.floor(Math.random() * (data.data.children.length - 1));

            if(data.data.children[random].data.media || data.data.children[random].data.stickied) return this.getCutePosts(message, args);
            
            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: data.data.children[random].data.title,
                url: `https://www.reddit.com${data.data.children[random].data.permalink}`,
                image: {
                    url: data.data.children[random].data.url
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    }
}