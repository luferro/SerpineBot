const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const { erase } = require('../utils/message');

module.exports = {
    name: 'comics',
    async getComics(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ').toLowerCase();
        switch(query) {
            case 'cyanide and happiness': return await this.getPosts(message, 'Cyanide and Happiness', 'http://explosm.net/comics/random');
            case 'garfield': return await this.getPosts(message, 'Garfield by Jim Davis', 'https://www.gocomics.com/random/garfield');
            case 'fowl language': return await this.getPosts(message, 'Fowl Language by Brian Gordon', 'https://www.gocomics.com/random/fowl-language');
            case 'sarahs scribbles': return await this.getPosts(message, 'Sarah\'s Scribbles by Sarah Andersen', 'https://www.gocomics.com/random/sarahs-scribbles');
            case 'peanuts': return await this.getPosts(message, 'Peanuts by Charles Schulz', 'https://www.gocomics.com/random/peanuts');
            case 'calvin and hobbes': return await this.getPosts(message, 'Calvin and Hobbes by Bill Watterson', 'https://www.gocomics.com/random/calvinandhobbes');
            case 'get fuzzy': return await this.getPosts(message, 'Get Fuzzy by Darby Conley', 'https://www.gocomics.com/random/getfuzzy');
            case 'jake likes onions': return await this.getPosts(message, 'Jake Likes Onions by Jake Thompson', 'https://www.gocomics.com/random/jake-likes-onions');
            default: return message.channel.send('./cmd comics');
        }
    },
    async getPosts(message, title, url) {
        const res = await fetch(url, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title,
            image: {
                url: $('.comic').attr('data-image') ? $('.comic').attr('data-image') : `https:${$('#main-comic').attr('src')}`
            } 
        }});
    }
}