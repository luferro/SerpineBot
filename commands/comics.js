import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';

const getComics = async interaction => {
    const category = interaction.options.getInteger('category');

    const getCategoryComics = category => {
        const options = {
            1: { name: 'Garfield by Jim Davis', url: 'https://www.gocomics.com/random/garfield' },
            2: { name: 'Peanuts by Charles Schulz', url: 'https://www.gocomics.com/random/peanuts' },
            3: { name: 'Get Fuzzy by Darby Conley', url: 'https://www.gocomics.com/random/getfuzzy' },
            4: { name: 'Fowl Language by Brian Gordon', url: 'https://www.gocomics.com/random/fowl-language' },
            5: { name: 'Calvin and Hobbes by Bill Watterson', url: 'https://www.gocomics.com/random/calvinandhobbes' },
            6: { name: 'Jake Likes Onions by Jake Thompson', url: 'https://www.gocomics.com/random/jake-likes-onions' },
            7: { name: 'Sarah\'s Scribbles by Sarah Andersen', url: 'https://www.gocomics.com/random/sarahs-scribbles' } 
        };
        return options[category];
    };
    const comic = getCategoryComics(category);
    const data = await fetchData(comic.url);
    const $ = load(data);

    const image = $('.comic').attr('data-image');
    if(!image) return interaction.reply({ content: `Couldn't find a comic image for ${comic.name}.`, ephemeral: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(comic.name)
            .setImage(image)
            .setColor('RANDOM')
    ]});
}

export default { getComics };