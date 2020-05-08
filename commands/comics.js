const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'comics',
    async execute(message, args){
        switch(args[1]) {
            case 'cyanide':
                message.delete({ timeout: 5000 });

                got('http://explosm.net/comics/random').then(response => {
                    var $ = cheerio.load(response.body);

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Cyanide and Hapiness",
                        url: "http://explosm.net/",
                        image: {
                            url: "https:"+$('#main-comic').attr("src")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });				
            break;
            case 'garfield':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/garfield').then(response => {
                    var $ = cheerio.load(response.body);
 
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Garfield by Jim Davis",
                        url: "https://www.gocomics.com/garfield",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'fowl':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/fowl-language').then(response => {
                    var $ = cheerio.load(response.body);
              
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Fowl Language by Brian Gordon",
                        url: "https://www.gocomics.com/fowl-language",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'sarah':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/sarahs-scribbles').then(response => {
                    var $ = cheerio.load(response.body);
         
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Sarah's Scribbles by Sarah Andersen",
                        url: "https://www.gocomics.com/sarahs-scribbles",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'peanuts':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/peanuts').then(response => {
                    var $ = cheerio.load(response.body);

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Peanuts by Charles Schulz",
                        url: "https://www.gocomics.com/peanuts",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'calvin':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/calvinandhobbes').then(response => {
                    var $ = cheerio.load(response.body);

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Calvin and Hobbes by Bill Watterson",
                        url: "https://www.gocomics.com/calvinandhobbes",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'getfuzzy':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/getfuzzy').then(response => {
                    var $ = cheerio.load(response.body);

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Get Fuzzy by Darby Conley",
                        url: "https://www.gocomics.com/getfuzzy",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            case 'jake':
                message.delete({ timeout: 5000 });
			
                got('https://www.gocomics.com/random/jake-likes-onions').then(response => {
                    var $ = cheerio.load(response.body);

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Jake Likes Onions by Jake Thompson",
                        url: "https://www.gocomics.com/jake-likes-onions",
                        image: {
                            url: $('.comic').attr("data-image")
                        } 
                    }})	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
            break;
            default:
                message.channel.send('Usage: ./comics <cyanide, garfield, fowl, sarah, peanuts, calvin, getfuzzy, jake>').then(m => {m.delete({ timeout: 5000 })});
        }
    }
}