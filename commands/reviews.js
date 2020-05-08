const fetch = require('node-fetch');

module.exports = {
    name: 'reviews',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        let argsgames = args.slice(2).join(" ");
        
        fetch('https://i.reddit.com/r/Games/search.json?q=%22Review%20Thread%22&limit=100&sort=new&restrict_sr=1')
        .then(response => response.json())
        .then(function(data) {

            if(!args[1]){
                var reviewedgames = "";
                for(var i= 0; i < 10; i++) {
                    reviewedgames += data.data.children[i].data.title+"\n\n";
                }

                return message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Last 10 reviewed games were:",
                    description: reviewedgames
                }});
            }
                        
            for(var i = 0; i < Object.keys(data.data.children).length; i++) {
                if(data.data.children[i].data.link_flair_text != "Review Thread")
                    i++;
                if((data.data.children[i].data.title).toLowerCase().indexOf(argsgames.toLowerCase()) >= 0) 
                    break;
            }
           
            try {
                let selftextReviews = (data.data.children[i].data.selftext).split("\n");
                for(var j = 0; j <= selftextReviews.length; j++){
                    var OpenCriticScore = selftextReviews[j].search("OpenCritic");
                    if(OpenCriticScore != -1) break;
                }

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: data.data.children[i].data.title,
                    url: data.data.children[i].data.url,
                    description: selftextReviews[j]
                }})
                .catch(function(error) {
                    message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                }); 
            } catch (error) {
                message.channel.send("Couldn't find game.").then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            }
        })							
    }
}