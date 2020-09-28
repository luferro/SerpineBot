const fetch = require('node-fetch');

module.exports = {
    name: 'weather',
    async execute(message, args){
        if(!args[1]) return message.channel.send("Usage: ./weather <city>").then(m => {m.delete({ timeout: 5000 })});
			
        let argsweather = args.slice(1).join(" ");
        
        message.delete({ timeout: 5000 });
        
        fetch('https://api.openweathermap.org/data/2.5/weather?q='+argsweather+'&appid='+process.env.OpenWeatherAPIkey+'&units=metric')
            .then(response => response.json())
            .then(data => message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: "Weather in "+data.name+', '+data.sys.country,
                fields: [{
                        name: "Description",
                        value: data.weather[0].main+' - '+data.weather[0].description
                    },
                    {
                        name: "Current",
                        value: data.main.temp+' ºC'
                    },
                    {
                        name: "Feels Like",
                        value: data.main.feels_like+' ºC'
                    },
                    {
                        name: "Highest",
                        value: data.main.temp_max+' ºC',
                        inline: true
                    },
                    {
                        name: "Lowest",
                        value: data.main.temp_min+' ºC',
                        inline: true
                    }
                ],
                thumbnail: {
                url: 'http://openweathermap.org/img/wn/'+data.weather[0].icon+'@2x.png'
                }
            }}))
            .catch(function(error) {
                message.channel.send("City "+argsweather+" doesn't exist!").then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            });   									
    }
}