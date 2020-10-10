const fetch = require('node-fetch');

module.exports = {
    name: 'holidays',
    async execute(message, args){
        if(!args[1] || !args[2]) return message.channel.send("Usage: ./holidays <month: 1-12> <year>").then(m => {m.delete({ timeout: 5000 })});
			
        message.delete({ timeout: 5000 });
        
        let color_holidays = Math.floor(Math.random() * 16777214) + 1;
                
        fetch('https://calendarific.com/api/v2/holidays?&country=PT&month='+args[1]+'&year='+args[2]+'&api_key='+process.env.CalendarificAPI)
            .then(response => response.json())
            .then(function(data) {
                for(let i = 0; i < Object.keys(data.response.holidays).length; i++) {
                    message.author.send({embed: {
                        color: color_holidays,
                        title: data.response.holidays[i].name,
                        fields: [{
                                name: "Description",
                                value: data.response.holidays[i].description
                            },
                            {
                                name: "Date",
                                value: data.response.holidays[i].date.datetime.day+'/'+data.response.holidays[i].date.datetime.month+'/'+data.response.holidays[i].date.datetime.year
                            },
                            {
                                name: "Locations",
                                value: data.response.holidays[i].locations
                            }
                        ]
                    }}).then(m => {m.delete({ timeout: 1000*60*5 })})
                    .catch(function(error) {
                        message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });  
                }
            })
            
        message.channel.send("Private message with all holidays on "+args[1]+"/"+args[2]+" has been sent! These will be deleted in 5 minutes.").then(m => {m.delete({ timeout: 10000 })});						
    }
}