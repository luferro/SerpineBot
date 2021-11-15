import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { erase } from '../utils/message.js';

const getReddit = async(message, args) => {
    erase(message, 5000);

    const getSubreddits = type => {
        const options = {
            'aww': ['aww', 'tuckedinkitties', 'dogpictures', 'catpictures', 'rarepuppers'],
            'memes': ['memes', 'dankmemes']
        };
        return options[type] || null;
    };
    const subreddits = getSubreddits(args[0]);
    if(!subreddits) return message.channel.send({ content: `./cmd ${args[0]}` });

    await getPosts(message, subreddits);
}

const getPosts = async(message, subreddits) => {
    const type = Math.floor(Math.random() * (subreddits.length - 1));

    const res = await fetch(`https://www.reddit.com/r/${subreddits[type]}/.json?limit=100&restrict_sr=1`);
    const data = await res.json();

    const random = Math.floor(Math.random() * (data.data.children.length - 1));
    if(data.data.children[random].data.media || data.data.children[random].data.stickied) return await getPosts(message, subreddits);

    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle(data.data.children[random].data.title)
                .setURL(`https://www.reddit.com${data.data.children[random].data.permalink}`)
                .setImage(data.data.children[random].data.url)
                .setColor(Math.floor(Math.random() * 16777214) + 1)
        ]
    });
}

export default { getReddit };