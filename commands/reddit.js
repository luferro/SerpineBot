import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

const getReddit = async interaction => {
    const category = interaction.options.getInteger('category');

    const getCategorySubreddits = category => {
        const options = {
            1: ['aww', 'tuckedinkitties', 'dogpictures', 'catpictures', 'rarepuppers'],
            2: ['memes', 'dankmemes']
        };
        return options[category] || null;
    };
    const subreddits = getCategorySubreddits(category);
    if(!subreddits) return interaction.reply({ content: 'Invalid Reddit category.', ephemeral: true });

    const subreddit = subreddits[Math.floor(Math.random() * (subreddits.length - 1))]

    const res = await fetch(`https://www.reddit.com/r/${subreddit}/.json?limit=100&restrict_sr=1`);
    if(!res.ok) return interaction.reply({ content: 'Something went wrong connecting to Reddit. Please try again later.' });
    const posts = await res.json();

    const filteredPosts = posts.data.children.filter(post => !post.data.stickied && !post.data.is_video && !post.data.removed_by_category);
    const random = Math.floor(Math.random() * (filteredPosts.length - 1));

    const title = filteredPosts[random].data.title;
    const permalink = filteredPosts[random].data.permalink;
    const url = filteredPosts[random].data.url;

    if(url.includes('gif') || url.includes('gifv') || url.includes('mp4')) return interaction.reply({ content: `**[${title}](<https://www.reddit.com${permalink}>)**\n${url}` });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(`https://www.reddit.com${permalink}`)
            .setImage(url)
            .setColor('RANDOM')
    ]});
}

export default { getReddit };