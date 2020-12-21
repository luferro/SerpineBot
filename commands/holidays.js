const fetch = require('node-fetch');

module.exports = {
    name: 'holidays',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1] || !args[2]) return message.channel.send("Usage: ./holidays <month: 1-12> <year>").then(m => {m.delete({ timeout: 5000 })});
                
        fetch(`https://calendarific.com/api/v2/holidays?&country=PT&month=${args[1]}&year=${args[2]}+'&api_key=${process.env.CalendarificAPI}`)
            .then(response => response.json())
            .then(data => {
                for (const index in data.response.holidays) {
                    message.author.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: data.response.holidays[index].name,
                        fields: [{
                                name: 'Description',
                                value: data.response.holidays[index].description
                            },
                            {
                                name: 'Date',
                                value: `${data.response.holidays[index].date.datetime.day}/${data.response.holidays[index].date.datetime.month}/${data.response.holidays[index].date.datetime.year}`
                            },
                            {
                                name: 'Locations',
                                value: data.response.holidays[index].locations
                            }
                        ]
                    }})
                    .then(m => { m.delete({ timeout: 1000*60*10 }) })
                    .catch(error => {
                        console.log(error);
                    });  
                }
            })
            
        message.channel.send(`Private message with all holidays on ${args[1]}/${args[2]} has been sent! These will be deleted in 10 minutes.`).then(m => { m.delete({ timeout: 1000*60 }) });						
    }
}