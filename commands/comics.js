import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import UserAgent from 'user-agents';

const getComics = async interaction => {
    const category = interaction.options.getInteger('category');

    const getCategoryComics = category => {
        const options = {
            1: { name: 'Cyanide and Happiness', url: 'http://explosm.net/comics/random' },
            2: { name: 'Garfield by Jim Davis', url: 'https://www.gocomics.com/random/garfield' },
            3: { name: 'Peanuts by Charles Schulz', url: 'https://www.gocomics.com/random/peanuts' },
            4: { name: 'Get Fuzzy by Darby Conley', url: 'https://www.gocomics.com/random/getfuzzy' },
            5: { name: 'Fowl Language by Brian Gordon', url: 'https://www.gocomics.com/random/fowl-language' },
            6: { name: 'Calvin and Hobbes by Bill Watterson', url: 'https://www.gocomics.com/random/calvinandhobbes' },
            7: { name: 'Jake Likes Onions by Jake Thompson', url: 'https://www.gocomics.com/random/jake-likes-onions' },
            8: { name: 'Sarah\'s Scribbles by Sarah Andersen', url: 'https://www.gocomics.com/random/sarahs-scribbles' } 
        };
        return options[category] || null;
    };

    const comic = getCategoryComics(category);
    if(!comic) return interaction.reply({ content: 'Invalid comic category.', ephemeral: true });
    
    const res = await fetch(comic.url, { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(comic.name)
            .setImage($('.comic').attr('data-image') || `https:${$('#main-comic').attr('src')}`)
            .setColor(Math.floor(Math.random() * 16777214) + 1)
    ]});
}

export default { getComics };