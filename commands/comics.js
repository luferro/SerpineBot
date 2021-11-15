import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import UserAgent from 'user-agents';
import { erase } from '../utils/message.js';

const getComics = async(message, args) => {
    erase(message, 5000);

    const query = args.slice(1).join(' ').toLowerCase();
    switch (query) {
        case 'cyanide and happiness': return await getPosts(message, 'Cyanide and Happiness', 'http://explosm.net/comics/random');
        case 'garfield': return await getPosts(message, 'Garfield by Jim Davis', 'https://www.gocomics.com/random/garfield');
        case 'fowl language': return await getPosts(message, 'Fowl Language by Brian Gordon', 'https://www.gocomics.com/random/fowl-language');
        case 'sarahs scribbles': return await getPosts(message, 'Sarah\'s Scribbles by Sarah Andersen', 'https://www.gocomics.com/random/sarahs-scribbles');
        case 'peanuts': return await getPosts(message, 'Peanuts by Charles Schulz', 'https://www.gocomics.com/random/peanuts');
        case 'calvin and hobbes': return await getPosts(message, 'Calvin and Hobbes by Bill Watterson', 'https://www.gocomics.com/random/calvinandhobbes');
        case 'get fuzzy': return await getPosts(message, 'Get Fuzzy by Darby Conley', 'https://www.gocomics.com/random/getfuzzy');
        case 'jake likes onions': return await getPosts(message, 'Jake Likes Onions by Jake Thompson', 'https://www.gocomics.com/random/jake-likes-onions');
        default: return message.channel.send({ content: './cmd comics' });
    }
}

const getPosts = async(message, title, url) => {
    const res = await fetch(url, { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle(title)
                .setImage($('.comic').attr('data-image') || `https:${$('#main-comic').attr('src')}`)
                .setColor(Math.floor(Math.random() * 16777214) + 1)
        ]
    });
}


export default { getComics };