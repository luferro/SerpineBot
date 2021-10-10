const fetch = require('node-fetch');
const { erase } = require('../utils/message');

module.exports = {
    name: 'reddit',
    async getReddit(message, args) {
        erase(message, 5000);

        const getSubreddits = type => {
            const options = {
                'aww': ['aww', 'tuckedinkitties', 'dogpictures', 'catpictures', 'rarepuppers'],
                'memes': ['memes', 'dankmemes']
            }
            return options[type] || null;
        }
        const subreddits = getSubreddits(args[0]);
        if(!subreddits) return message.channel.send('./cmd aww');

        await this.getPosts(message, subreddits);
    },
    async getPosts(message, subreddits) {
        const type = Math.floor(Math.random() * (subreddits.length - 1));
        
        const res = await fetch(`https://www.reddit.com/r/${subreddits[type]}/.json?limit=100&restrict_sr=1`);
        const data = await res.json();

        const random = Math.floor(Math.random() * (data.data.children.length - 1));

        if(data.data.children[random].data.media || data.data.children[random].data.stickied) return await this.getPosts(message, subreddits);
        
        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: data.data.children[random].data.title,
            url: `https://www.reddit.com${data.data.children[random].data.permalink}`,
            image: {
                url: data.data.children[random].data.url
            } 
        }});
    }
}