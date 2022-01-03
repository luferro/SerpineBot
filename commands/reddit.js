import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';

const getReddit = async interaction => {
    const category = interaction.options.getInteger('category');

    const getCategorySubreddits = category => {
        const options = {
            1: ['aww', 'tuckedinkitties', 'dogpictures', 'catpictures', 'rarepuppers'],
            2: ['memes', 'dankmemes']
        };
        return options[category];
    };
    const subreddits = getCategorySubreddits(category);
    
    const subreddit = subreddits[Math.floor(Math.random() * (subreddits.length - 1))];
    const data = await fetchData(`https://www.reddit.com/r/${subreddit}/.json?limit=100&restrict_sr=1`);
    if(data.data.children.length === 0) return interaction.reply({ content: 'Couldn\'t fetch reddit post.', ephemeral: true });

    const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category);
    const random = Math.floor(Math.random() * (filteredData.length - 1));
    const { title, url, permalink } = filteredData[random].data;

    const hasVideoExtension = ['gif', 'gifv', 'mp4'].some(item => url.includes(item));
    if(hasVideoExtension) return interaction.reply({ content: `**[${formatTitle(title)}](<https://www.reddit.com${permalink}>)**\n${url}` });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(formatTitle(title))
            .setURL(`https://www.reddit.com${permalink}`)
            .setImage(url)
            .setFooter('Powered by Reddit.')
            .setColor('RANDOM')
    ]});
}

export default { getReddit };