const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'books',
    async execute(message, args){      
        switch(args[1]) {
            case '-s':
                message.delete({ timeout: 5000 });

                let argsbooks = args.slice(3).join(" ");

                switch(args[2]) {
                    case 'bd':
                        got(`https://www.bookdepository.com/search?searchTerm=${argsbooks}&search=Find+book/`).then(response => {
                            const $ = cheerio.load(response.body);

                            let all_results = '';

                            let all_results_item = [];
                            $('.title a').each((i, element) => {
                                const itens = $(element).text();
                                const itens_nospaces = itens.trim();
                                all_results_item.push(itens_nospaces);
                            });	
                            let all_results_price = [];
                            $('.price').each((i, element_price) => {
                                const itens_price = $(element_price).clone().children().remove().end().text();
                                const itens_price_nospaces = itens_price.trim();
                                all_results_price.push(itens_price_nospaces);
                            });	

                            let tam = 10;
                            if(all_results_item.length < tam)
                                tam = all_results_item.length;

                            for(let i = 0; i < tam; i++)
                                all_results += `${all_results_item[i]}\n**Price: **${all_results_price[i]}\n\n`;
                            
                            message.channel.send({embed: {
                                color: Math.floor(Math.random() * 16777214) + 1,
                                title: `Search results for ${argsbooks}`,
                                description: all_results
                            }})
                        })
                        .catch(error => {
                            message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                            console.log(error);
                        });		
                    break;
                    case 'bertrand':
                        got(`https://www.bertrand.pt/pesquisa/${argsbooks}`).then(response => {
                            const $ = cheerio.load(response.body);

                            let all_results = '';

                            let all_results_item = [];
                            $('#search-page .title p .title-lnk').each((i, element) => {
                                const itens = $(element).text();
                                all_results_item.push(itens);
                            });	
                            let all_results_item_vol = [];
                            $('#search-page .subtitle-product p').each((i, element) => {
                                const itens_vol = $(element).text();
                                all_results_item_vol.push(itens_vol);
                            });	
                            let all_results_price = [];
                            $('#search-page .active-price').each((i, element_price) => {
                                const itens_price = $(element_price).text();
                                all_results_price.push(itens_price);
                            });	

                            let tam = 10;
                            if(all_results_item.length < tam)
                                tam = all_results_item.length;

                            for(let i = 0; i < tam; i++) {
                                let vol = all_results_item_vol[i];
                                if(!vol) vol = '';
                                all_results += `${all_results_item[i]} ${vol}\n**Price: **${all_results_price[i]}\n\n`;
                            }
                            
                            message.channel.send({embed: {
                                color: Math.floor(Math.random() * 16777214) + 1,
                                title: `Search results for ${argsbooks}`,
                                description: all_results
                            }})
                        })
                        .catch(error => {
                            message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                            console.log(error);
                        });		
                    break;
                    default:
                        message.channel.send('Usage: ./books <-s or -d> <bd or bertrand> product_title').then(m => {m.delete({ timeout: 5000 })});
                }
            break;
            case '-d':
                message.delete({ timeout: 5000 });

                let argsdetailsbooks = args.slice(3).join(" ");

                switch(args[2]) {
                    case 'bd':
                        got(`https://www.bookdepository.com/search?searchTerm=${argsdetailsbooks}&search=Find+book/`).then(response => {
                            var $ = cheerio.load(response.body);

                            let all_results_href = [];
                            $('.title a').each((i, element) => {
                                const itens_href = $(element).attr('href');
                                all_results_href.push(itens_href);
                            });	

                            got(`https://www.bookdepository.com${all_results_href[0]}`).then(response => {
                                var $ = cheerio.load(response.body);

                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    author: {
                                        name: `Details found for ${argsdetailsbooks}`
                                    },
                                    title: $('.item-info h1').text(),
                                    url: `https://www.bookdepository.com${all_results_href[0]}`,
                                    description: `**Price: **${$('.price .sale-price').text()}\n\n${$('.availability-text p').clone().children().remove().end().text().trim()}\n\n${$('.item-excerpt').clone().children().remove().end().text().trim()}`,
                                    thumbnail: {
                                        url: $('.book-img').attr('src')
                                    }
                                }})
                            }).catch(error => {
                                message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                                console.log(error);
                            });	
                        })
                        .catch(error => {
                            message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                            console.log(error);
                        });		
                    break;
                    case 'bertrand':
                        got(`https://www.bertrand.pt/pesquisa/${argsdetailsbooks}`).then(response => {
                            var $ = cheerio.load(response.body);

                            let all_results_href = [];
                            $('.title-lnk').each((i, element) => {
                                const itens_href = $(element).attr('href');
                                all_results_href.push(itens_href);
                            });	

                            got(`https://www.bertrand.pt${all_results_href[0]}`).then(response => {
                                var $ = cheerio.load(response.body);

                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    author: {
                                        name: `Details found for ${argsdetailsbooks}`
                                    },
                                    title: `${$('#productPageRightSectionTop-title-h1').text()}   ${$('#productPageRightSectionTop-subtitle-h2').text()}`,
                                    url: `https://www.bertrand.pt${all_results_href[0]}`,
                                    description: `**Price: **${$('#productPageRightSectionTop-saleAction-price-current').text()}\n\n${$('#productPageRightSectionTop-salesInfo-stock24hours .text-info').text()}\n\n${$('#productPageSectionAboutBook-sinopse p').text()}`,
                                    thumbnail: {
                                        url: $('#productPageLeftSectionTop-images img').attr('src')
                                    }
                                }})
                            })
                            .catch(error => {
                                message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                                console.log(error);
                            });	
                        })
                        .catch(error => {
                            message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                            console.log(error);
                        });		
                    break;
                    default:
                        message.channel.send('Usage: ./books <-s or -d> <bd, fnac or bertrand> product_title').then(m => {m.delete({ timeout: 5000 })});
                }
            break;
            case '-c':
                message.delete({ timeout: 5000 });

                let argscomparebooks = args.slice(2).join(" ");
                
                let bertrand = [], bookdepository = [];

                got(`https://www.bertrand.pt/pesquisa/${argscomparebooks}`).then(response => {
                    var $ = cheerio.load(response.body);

                    let title_bertrand = $('#search-page .title p .title-lnk').first().text();
                    if(title_bertrand) bertrand.push(title_bertrand);
                    else bertrand.push('No stock.');
                    bertrand.push();

                    let url_bertrand = $('#search-page .title p .title-lnk').first().attr('href');
                    if(url_bertrand) bertrand.push(`https://www.bertrand.pt${url_bertrand}`);
                    else bertrand.push('No stock.');

                    let price_bertrand = $('#search-page .active-price').first().text();
                    if(price_bertrand) bertrand.push(price_bertrand);
                    else bertrand.push('No stock.');
                   

                    got(`https://www.bookdepository.com/search?searchTerm=${argscomparebooks}&search=Find+book/`).then(response => {
                        var $ = cheerio.load(response.body);

                        let titulo_bd = $('.title a').first().text();
                        if(titulo_bd) bookdepository.push(titulo_bd.trim());
                        else bookdepository.push("Doesn't exist.");
                        
                        let url_bd = $('.title a').first().attr('href');
                        if(url_bd) bookdepository.push(`https://www.bookdepository.com${url_bd.trim()}`);
                        else bookdepository.push("Doesn't exist.");

                        let price_bd = $('.price').first().clone().children().remove().end().text();
                        if(price_bd) bookdepository.push(price_bd.trim());
                        else bookdepository.push("Doesn't exist.");
                       
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: `Compare results for ${argscomparebooks}`,
                            description: `**Book Depository**\n${bookdepository[0]}\n**URL: **${bookdepository[1]}\n**Price: **${bookdepository[2]}\n\n**Bertrand**\n${bertrand[0]}\n**URL: **${bertrand[1]}\n**Price: **${bertrand[2]}`
                        }})
                    })
                    .catch(error => {
                        message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });		
                })
                .catch(error => {
                    message.channel.send('Something went wrong!').then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });		
            break;
            default:
                message.channel.send('Usage: ./books <-s or -d> <bd, fnac or bertrand> product_title').then(m => {m.delete({ timeout: 5000 })});
        }
    }
}