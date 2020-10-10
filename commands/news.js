const fetch = require('node-fetch');

module.exports = {
    name: 'news',
    async execute(message, args){
        if(!args[1] || !args[2]) return message.channel.send("Usage: ./news <country 2-digit code> <category>	category: 's - sports', 'b - business', 'h - health', 'sci - science', 't - technology' or 'e - entertainment'").then(m => {m.delete({ timeout: 5000 })});
			
        message.delete({ timeout: 5000 });
        
        let category_news;

        switch (args[2]) {
            case 's':
                category_news = 'sports';
                break;
            case 'b':
                category_news = 'business'; 
                break;
            case 'h':
                category_news = 'health'; 
                break;
            case 'sci':
                category_news = 'science'; 
                break;
            case 't':
                category_news = 'technology'; 
                break;
            case 'e':
                category_news = 'entertainment'; 
                break;
            default:
                return message.channel.send("Category doesn't exist").then(m => {m.delete({ timeout: 5000 })});
        }
        
        fetch('http://newsapi.org/v2/top-headlines?country='+args[1]+'&category='+category_news+'&apiKey='+process.env.NEWSAPI)
            .then(response => response.json())
            .then(function(data) {	
                let i = Math.floor(Math.random() * Object.keys(data.articles).length) + 1;
                
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: data.articles[i].title,
                    fields: [{
                            name: "Description",
                            value: data.articles[i].description
                        },
                        {
                            name: "URL",
                            value: data.articles[i].url
                        },
                        {
                            name: "Content",
                            value: data.articles[i].content
                        }
                    ],
                    timestamp: data.articles[i].publishedAt
                }})
                .catch(function(error) {
                    message.channel.send('Something went wrong.').then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });  
            })						
    }
}