const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'deals',
    async execute(message, args){      
        switch(args[1]) {
            case '-s':
                message.delete({ timeout: 5000 });

                let argssearch = args.slice(2).join(" ");

                got('https://comparador.zwame.pt/pesquisa/'+argssearch).then(response => {
                    var $ = cheerio.load(response.body);

                    let all_results = '';

                    let all_results_item = [];
                    $('#category-products h3').each((i, element) => {
                        const itens = $(element).text();
                        all_results_item.push(itens);
                    });	
                    let all_results_price = [];
                    $('#category-products .amount').each((i, element_price) => {
                        const itens_price = $(element_price).text();
                        all_results_price.push(itens_price);
                    });	

                    let all_results_href = [];
                    $('#category-products .product-outer a').each((i, element) => {
                        const itens_href = $(element).attr('href');
                        all_results_href.push(itens_href);
                    });

                    for(let i = 0; i < 10; i++)
                        all_results += all_results_item[i] + '\n**Price: **' + all_results_price[i] + '\n**Check it out [here](https://comparador.zwame.pt' + all_results_href[i] + ')**\n\n';
                    
                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "Search results for " + argssearch,
                        description: all_results
                    }})
                }).catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });		
                break;
            case '-d':
                message.delete({ timeout: 5000 });

                let argsdetails = args.slice(2).join(" ");

                got('https://comparador.zwame.pt/pesquisa/'+argsdetails).then(response => {
                    var $ = cheerio.load(response.body);

                    let all_results_href = [];
                    $('#category-products .product-outer a').each((i, element) => {
                        const itens_href = $(element).attr('href');
                        all_results_href.push(itens_href);
                    });	

                    got('https://comparador.zwame.pt'+all_results_href[0]).then(response => {
                        var $ = cheerio.load(response.body);

                        let stores = [];
                        $('.store-offers .store-image img').each((i, element) => {
                            const item_store = $(element).attr('alt');
                            stores.push(item_store);
                        });	

                        let stores_prices = [];
                        $('.store-offers .store-price').each((i, element) => {
                            const item_store_price = $(element).text();
                            stores_prices.push(item_store_price);
                        });	

                        let stores_url = [];
                        $('.store-offers a').each((i, element) => {
                            const item_store_url = $(element).attr('href');
                            stores_url.push(item_store_url);
                        });	

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            author: {
                                name: "Details found for " + argsdetails
                            },
                            title: $('.page-title').text(),
                            url: stores_url[0],
                            description: "**Lowest price: **" + stores_prices[0] + '\n\n' + '**Store: **' + stores[0]
               
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
                message.channel.send("Usage: ./deals <search or details> product_title").then(m => {m.delete({ timeout: 5000 })});
                break;
        }
    }
}