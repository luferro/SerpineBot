const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'comics',
    async execute(message, args){
        message.delete({ timeout: 5000 });
        
        switch(args[1]) {
            case 'cyanide':
                got('http://explosm.net/comics/random')
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Cyanide and Hapiness',
                            url: 'http://explosm.net/',
                            image: {
                                url: `https:${$('#main-comic').attr('src')}`
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });				
                break;
            case 'garfield':	
                got('https://www.gocomics.com/random/garfield')
                    .then(response => {
                        const $ = cheerio.load(response.body);
    
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Garfield by Jim Davis',
                            url: 'https://www.gocomics.com/garfield',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'fowl':
                got('https://www.gocomics.com/random/fowl-language')
                    .then(response => {
                        const $ = cheerio.load(response.body);
                
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Fowl Language by Brian Gordon',
                            url: 'https://www.gocomics.com/fowl-language',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'sarah':			
                got('https://www.gocomics.com/random/sarahs-scribbles')
                    .then(response => {
                        const $ = cheerio.load(response.body);
            
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: "Sarah's Scribbles by Sarah Andersen",
                            url: 'https://www.gocomics.com/sarahs-scribbles',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'peanuts':			
                got('https://www.gocomics.com/random/peanuts')
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Peanuts by Charles Schulz',
                            url: 'https://www.gocomics.com/peanuts',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'calvin':
                got('https://www.gocomics.com/random/calvinandhobbes')
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Calvin and Hobbes by Bill Watterson',
                            url: 'https://www.gocomics.com/calvinandhobbes',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'getfuzzy':			
                got('https://www.gocomics.com/random/getfuzzy')
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Get Fuzzy by Darby Conley',
                            url: 'https://www.gocomics.com/getfuzzy',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            case 'jake':
                got('https://www.gocomics.com/random/jake-likes-onions')
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: 'Jake Likes Onions by Jake Thompson',
                            url: 'https://www.gocomics.com/jake-likes-onions',
                            image: {
                                url: $('.comic').attr('data-image')
                            } 
                        }})	
                    })
                    .catch(error => {
                        console.log(error);
                    });	
                break;
            default:
                message.channel.send('Usage: ./comics <cyanide, garfield, fowl, sarah, peanuts, calvin, getfuzzy, jake>').then(m => { m.delete({ timeout: 5000 }) });
                break;
        }
    }
}