const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'cmpgame',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        let argsgame = args.slice(1).join(' ');

        if(!args[1]) return message.channel.send('Usage: ./cmpgame <game_title>').then(m => { m.delete({ timeout: 5000 }) });

        got(`https://www.allkeyshop.com/blog/catalogue/search-${argsgame}`)
            .then(response => {
                var $ = cheerio.load(response.body);

                let url = $('.search-results .search-results-row-link').first().attr('href');
                if(!url) return message.channel.send("Couldn't find that game.").then(m => { m.delete({ timeout: 5000 }) });

                got(url)
                    .then(response => {
                        var $ = cheerio.load(response.body);

                        let items = [];
                        $('.offers-table .offers-table-row').each((i, element) => {
                            items.push({
                                store: $(element).find('.offers-merchant .offers-merchant-name').text().trim(),
                                platform: $(element).find('.offers-edition-region').text().trim(),
                                price: $(element).attr('data-price'),
                                hasCoupon: $(element).attr('data-voucher-discount-type') ? true : false,
                                coupon: $(element).find('.coupon .coupon-code').attr('data-clipboard-text'),
                                url: $(element).find('.buy-btn-cell .buy-btn').attr('href')
                            });
                        });	

                        items.length = 5;

                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            author: {
                                name: `Search results for ${argsgame}`
                            },
                            title:  $('.content-box .content-box-title h1 span').first().text().trim(),
                            description: items.map(item => `
                                **Store:** ${item.store}
                                **Platform:** ${item.platform}
                                **Price:** ${item.price}€
                                **Coupon:** ${item.hasCoupon ? item.coupon : 'No coupon available'}
                                Check it out **[here](https:${item.url})**!
                            `).join(' ')
                        }})
                    })
                    .catch(error => {
                        console.log(error);
                    });	
            })
            .catch(error => {
                console.log(error);
            });		
    }			
}