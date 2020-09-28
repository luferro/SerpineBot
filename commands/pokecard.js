const fetch = require('node-fetch');

module.exports = {
    name: 'pokecard',
    async execute(message, args){
        message.delete({ timeout: 5000 });
		
        page = Math.floor(Math.random() * 122) + 1;
        fetch('https://api.pokemontcg.io/v1/cards?page='+page)
            .then(response => response.json())
            .then(function(data) {			
                var i = Math.floor(Math.random() * Object.keys(data.cards).length) + 1;
            
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    image: {
                        url: data.cards[i].imageUrlHiRes
                    } 
                }})
                .catch(function(error) {
                    message.channel.send("Something went wrong.").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });
            })								
    }
}