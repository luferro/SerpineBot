const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'track',
    async execute(message, args){
        switch(args[1]) {
            case 'pcdiga':
                message.delete({ timeout: 5000 });

                if(!args[1]) return message.channel.send("Usage: ./track <store> <url product> <wanted price>").then(m => {m.delete({ timeout: 5000 })});;

                var url = args[2];
                var wanted_price = args[3];

                got(url).then(response => {
                    var $ = cheerio.load(response.body);

                var all_results_names = [];
                $('.page-title .base').each((i, element) => {
                    const itens_name = $(element).text().trim();
                    all_results_names.push(itens_name);
                });	

                var all_results_prices = [];
                $('.product-info-price .value--current-price .price').each((i, element) => {
                    const itens_price = $(element).text();
                    all_results_prices.push(itens_price);
                });	

                if(wanted_price < all_results_prices[all_results_prices.length - 1])
                
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: "Search results for " + argscmp
                    },
                    title:  $('.content-box .content-box-title h1 span').first().text(),
                    description: all_results
                }})
            }).catch(function(error) {
                message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                console.log(error);
            });		
            break;
        }
    }			
}