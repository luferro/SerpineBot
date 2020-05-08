const fetch = require('node-fetch');

module.exports = {
    name: 'animals',
    async execute(message, args){
        message.delete({ timeout: 5000 });
			
        var animals;
        var type = Math.floor((Math.random() * 4) + 1);
        if(type == 1) animals = 'cats';
        else if(type == 2) animals = 'dogpictures'
        else if(type == 3) animals = 'tuckedinkitties';
        else if(type == 4) animals = 'aww';
        
        fetch('https://i.reddit.com/r/'+animals+'/.json?limit=50&restrict_sr=1')
        .then(response => response.json())
        .then(function(data) {
                            
            var i = Math.floor(Math.random() * Object.keys(data.data.children).length) + 1;

            if(data.data.children[i].data.is_video == true || data.data.children[i].data.stickied == true || data.data.children[i].data == undefined || data.data.children[i].data.domain != "i.redd.it") i++;
            
            message.channel.send({embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: data.data.children[i].data.title,
                url: 'https://www.reddit.com'+data.data.children[i].data.permalink,
                image: {
                    url: data.data.children[i].data.url
                } 
            }})
            .catch(function(error) {
                message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            });  
        })			
    }
}