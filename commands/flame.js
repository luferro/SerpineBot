const fetch = require('node-fetch');
const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'flame',
    async execute(message){
        let type = Math.floor((Math.random() * 2) + 1);

        if(type === 1) {
            fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
                .then(response => response.json())
                .then(data => {				
                    message.channel.send(data.insult)
                })
                .catch(error => {
                    console.log(error);
                });	
        }
        else {
            got('https://fungenerators.com/random/insult/new-age-insult')
                .then(response => {
                    const $ = cheerio.load(response.body);
                    message.channel.send($('h2').text())	
                })
                .catch(error => {
                    console.log(error);
                });	
        }		
    }
}