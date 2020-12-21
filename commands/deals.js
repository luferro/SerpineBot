const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'deals',
    async execute(message, args){  
        message.delete({ timeout: 5000 });

        let argsdeals = args.slice(2).join(' ');

        switch(args[1]) {
            case '-s':
                if(!args[2]) return message.channel.send('Usage: ./deals -s <product>').then(m => { m.delete({ timeout: 5000 }) });

                got(`https://comparador.zwame.pt/pesquisa/${argsdeals}`)
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        let items = [];
                        $('#category-products ul.products li').each((i, element) => {
                            items.push({
                                name: $(element).find('h3').text().trim(),
                                price: $(element).find('.amount').text().trim(),
                                url: $(element).find('.product-outer a').attr('href').trim()
                            })
                        })

                        items.length = 5;

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: `Search results for ${argsdeals}`,
                            description: items.map(item => `
                                **${item.name}**
                                **Price:** ${item.price}
                                Check it out **[here](https://comparador.zwame.pt${item.url})**!
                            `).join(' ')
                        }})
                    }).catch(error => {
                        console.log(error);
                    });		
                break;
            case '-d':
                if(!args[2]) return message.channel.send('Usage: ./deals -d <product>').then(m => { m.delete({ timeout: 5000 }) });

                got(`https://comparador.zwame.pt/pesquisa/${argsdeals}`)
                    .then(response => {
                        var $ = cheerio.load(response.body);

                        let url = $('#category-products .product-outer a').first().attr('href');
                        if(!url) return message.channel.send("Couldn't find that item.").then(m => { m.delete({ timeout: 5000 }) });
    
                        got(`https://comparador.zwame.pt${url}`)
                            .then(response => {
                                var $ = cheerio.load(response.body);

                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    author: {
                                        name: `Details found for ${argsdeals}`
                                    },
                                    title: $('.page-title').text(),
                                    url: $('.store-offers a').first().attr('href'),
                                    description: `
                                        **Store:** ${$('.store-offers .store-image img').first().attr('alt')}
                                        **Price:** ${$('.store-offers .store-price').first().text()}
                                    `
                                }})
                            }).catch(error => {
                                console.log(error);
                            });	
                    }).catch(error => {
                        console.log(error);
                    });		
                break;
            default:
                message.channel.send("Usage: ./deals <-s or -d> <product_title>").then(m => { m.delete({ timeout: 5000 }) });
                break;
        }
    }
}