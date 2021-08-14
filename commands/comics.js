const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: 'comics',
    async getComics(message, args) {
        message.delete({ timeout: 5000 });

        const comic_query = args.slice(1).join(' ');
        
        switch(comic_query.toLowerCase()) {
            case 'cyanide and happiness':
                try {
                    const res = await fetch('http://explosm.net/comics/random');
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
                break;
            case 'garfield':	
                try {
                    const res = await fetch('https://www.gocomics.com/random/garfield');
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
                break;
            case 'fowl language':
                try {
                    const res = await fetch('https://www.gocomics.com/random/fowl-language');
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
                break;
            case 'sarahs scribbles':
                try {
                    const res = await fetch('https://www.gocomics.com/random/sarahs-scribbles');
                    const html = await res.text();
                    const $ = cheerio.load(html);
        
                    message.channel.send({ embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Sarah's Scribbles by Sarah Andersen",
                        url: 'https://www.gocomics.com/sarahs-scribbles',
                        image: {
                            url: $('.comic').attr('data-image')
                        } 
                    }});
                } catch (error) {
                    console.log(error);
                }
                break;
            case 'peanuts':
                try {
                    const res = await fetch('https://www.gocomics.com/random/peanuts');
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
                break;
            case 'calvin and hobbes':
                try {
                    const res = await fetch('https://www.gocomics.com/random/calvinandhobbes');
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
                break;
            case 'get fuzzy':
                try {
                    const res = await fetch('https://www.gocomics.com/random/getfuzzy');
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
                break;
            case 'jake likes onions':
                try {
                    const res = await fetch('https://www.gocomics.com/random/jake-likes-onions');
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
                break;
            default:
                message.channel.send('Usage: ./comics <Comics category: cyanide and happiness, garfield, fowl language, sarahs scribbles, peanuts, calvin and hobbes, get fuzzy, jake likes onions>').then(m => { m.delete({ timeout: 5000 }) });
                break;
        }
    }
}