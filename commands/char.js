const fetch = require('node-fetch');

module.exports = {
    name: 'char',
    async execute(message, args){
        message.delete({ timeout: 5000 });
		
        var character = Math.floor(Math.random() * 731) + 1;
        
        fetch('https://superheroapi.com/api/'+process.env.SuperheroAPI+'/'+character)
        .then(response => response.json())
        .then(function(data) {				
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: data.name,
                description: data.biography.publisher,
                fields: [{
                        name: "Intelligence",
                        value: data.powerstats.intelligence,
                        inline: true
                    },
                    {
                        name: "Strength",
                        value: data.powerstats.strength,
                        inline: true
                    },
                    {
                        name: "Speed",
                        value: data.powerstats.speed,
                        inline: true
                    },
                    {
                        name: "Durability",
                        value: data.powerstats.durability,
                        inline: true
                    },
                    {
                        name: "Power",
                        value: data.powerstats.power,
                        inline: true
                    },
                    {
                        name: "Combat",
                        value: data.powerstats.combat,
                        inline: true
                    }
                ],
                image: {
                    url: data.image.url
                } 
            }})
            .catch(function(error) {
                message.channel.send("Something went wrong.").then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            }); 
        })								
    }
}