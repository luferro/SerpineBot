const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'ebooks',
    async execute(message, args){     
        switch(args[1]) {
            case '-s':
                message.delete({ timeout: 5000 });

                let argsebooks = args.slice(2).join(" ");

                got('https://play.google.com/store/search?q='+argsebooks+'&c=books').then(response => {
                    var $ = cheerio.load(response.body);

                    var all_results = '';

                    var all_results_item = [];
                    $('.WsMG1c').each((i, element) => {
                        const itens = $(element).text();
                        all_results_item.push(itens);
                    });	
                    var all_results_price = [];
                    $('.VfPpfd span').each((i, element_price) => {
                        const itens_price = $(element_price).text();
                        all_results_price.push(itens_price);
                    });	

                    var tam = 10;
                    if(all_results_item.length < tam)
                        tam = all_results_item.length;

                    for(var i = 0; i < tam; i++)
                        all_results += all_results_item[i] + '\n**Price: **' + all_results_price[i] + '\n\n';
                    
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Search results for " + argsebooks,
                        description: all_results
                    }})
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });		
                break;
            case '-d':
                message.delete({ timeout: 5000 });

                let argsdetailsebooks = args.slice(2).join(" ");

                got('https://play.google.com/store/search?q='+argsdetailsebooks+'&c=books').then(response => {
                    var $ = cheerio.load(response.body);

                    var all_results_href = [];
                    $('.poRVub').each((i, element) => {
                        const itens_href = $(element).attr('href');
                        all_results_href.push(itens_href);
                    });	

                    got('https://play.google.com'+all_results_href[0]).then(response => {
                        var $ = cheerio.load(response.body);

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            author: {
                                name: "Details found for " + argsdetailsebooks
                            },
                            title: $('.AHFaub').text(),
                            url: 'https://play.google.com' + all_results_href[0],
                            description: $('.DWPxHb span b').text(),
                            thumbnail: {
                                url: $('.T75of').attr('src')
                            }
                        }})
                    }).catch(function(error) {
                        message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });	
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });		
                break;
            default:
                message.channel.send("Usage: ./ebooks <search or details> product_title").then(m => {m.delete({ timeout: 5000 })});
                break;
        }
    }
}