const fetch = require('node-fetch');
const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'flame',
    async execute(message, args){
        let type = Math.floor((Math.random() * 2) + 1);

        switch (type) {
            case 1:
                fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
                    .then(response => response.json())
                    .then(function(data) {				
                        message.channel.send(data.insult)
                        .catch(function(error) {
                            message.channel.send("Something went wrong.").then(m => {m.delete({ timeout: 5000 })});
                            console.log(error);
                        }); 
                    })
                break;
            case 2:
                got('https://fungenerators.com/random/insult/new-age-insult').then(response => {
                    var $ = cheerio.load(response.body);
                    message.channel.send($("h2").text())	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });	
                break;
            default:
                break;
        }		
    }
}