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
            case 'cyanide and happiness': return this.getCyanideAndHappiness(message);
            case 'garfield': return this.getGarfield(message);
            case 'fowl language': return this.getFowlLanguage(message);
            case 'sarahs scribbles': return this.getSarahsScribbles(message);
            case 'peanuts': return this.getPeanuts(message);
            case 'calvin and hobbes': return this.getCalvinAndHobbes(message);
            case 'get fuzzy': return this.getGetFuzzy(message);
            case 'jake likes onions': return this.getJakeLikesOnions(message);
            default: return message.channel.send('./cmd comics');
        }
    },
    async getCyanideAndHappiness(message) {
        try {
            const res = await fetch('http://explosm.net/comics/random', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Cyanide and Happiness',
                url: 'http://explosm.net/',
                image: {
                    url: `https:${$('#main-comic').attr('src')}`
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getGarfield(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/garfield', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Garfield by Jim Davis',
                url: 'https://www.gocomics.com/garfield',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getFowlLanguage(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/fowl-language', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Fowl Language by Brian Gordon',
                url: 'https://www.gocomics.com/fowl-language',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getSarahsScribbles(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/sarahs-scribbles', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Sarah\'s Scribbles by Sarah Andersen',
                url: 'https://www.gocomics.com/sarahs-scribbles',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getPeanuts(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/peanuts', { headers: { 'User-Agent': new UserAgent().toString() } });
            const body = await res.text();
            const $ = cheerio.load(body);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Peanuts by Charles Schulz',
                url: 'https://www.gocomics.com/peanuts',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getCalvinAndHobbes(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/calvinandhobbes', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Calvin and Hobbes by Bill Watterson',
                url: 'https://www.gocomics.com/calvinandhobbes',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getGetFuzzy(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/getfuzzy', { headers: { 'User-Agent': new UserAgent().toString() } });
            const body = await res.text();
            const $ = cheerio.load(body);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Get Fuzzy by Darby Conley',
                url: 'https://www.gocomics.com/getfuzzy',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getJakeLikesOnions(message) {
        try {
            const res = await fetch('https://www.gocomics.com/random/jake-likes-onions', { headers: { 'User-Agent': new UserAgent().toString() } });
            const body = await res.text();
            const $ = cheerio.load(body);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Jake Likes Onions by Jake Thompson',
                url: 'https://www.gocomics.com/jake-likes-onions',
                image: {
                    url: $('.comic').attr('data-image')
                } 
            }});
        } catch (error) {
            console.log(error);
        }	
    }
}