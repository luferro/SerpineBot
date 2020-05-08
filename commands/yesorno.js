const fetch = require('node-fetch');

module.exports = {
    name: 'yesorno',
    async execute(message, args){
        fetch('https://yesno.wtf/api')
        .then(response => response.json())
        .then(function(data) {
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: data.answer,
                image: {
                    url: data.image
                } 
            }})
            .catch(function(error) {
                message.channel.send("Yesn't").then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            }); 
        })									
    }
}