const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'cmpgame',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send("Usage: ./cmpgame game_title").then(m => {m.delete({ timeout: 5000 })});

        var argscmp = args.slice(1).join(" ");

        message.channel.send("Searching...").then(m => {m.delete({ timeout: 3000 })});;

        got('https://www.allkeyshop.com/blog/catalogue/search-'+argscmp).then(response => {
            var $ = cheerio.load(response.body);

            var all_results_href = [];
            $('.search-results .search-results-row-link').each((i, element) => {
                const itens_href = $(element).attr('href');
                all_results_href.push(itens_href);
            });	

            if(!all_results_href[0]) return message.channel.send("Couldn't find that game.").then(m => {m.delete({ timeout: 5000 })});

            got(all_results_href[0]).then(response => {
                var $ = cheerio.load(response.body);

                var all_results_stores = [];
                $('.offers-table .offers-table-row .offers-merchant .offers-merchant-name').each((i, element) => {
                    const itens_stores = $(element).text().trim();
                    all_results_stores.push(itens_stores);
                });	

                var all_results_platform = [];
                $('.offers-table .offers-table-row .offers-edition-region').each((i, element) => {
                    const itens_platform = $(element).text().trim();
                    all_results_platform.push(itens_platform);
                });	

                var all_results_prices = [];
                var all_results_coupons_exist = [];
                $('.offers-table .offers-table-row').each((i, element) => {
                    const itens_prices = $(element).attr('data-price');
                    const itens_coupons = $(element).attr('data-voucher-discount-type')
                    if(itens_coupons)
                        all_results_coupons_exist.push('Existe');
                    else all_results_coupons_exist.push('Não Existe');
                    all_results_prices.push(itens_prices);
                });

                var all_results_coupons = [];
                $('.offers-table .offers-table-row .coupon .coupon-code').each((i, element) => {
                    const itens_coupons = $(element).attr('data-clipboard-text');
                    all_results_coupons.push(itens_coupons);
                });	

                var all_results_url = [];
                $('.offers-table .offers-table-row .buy-btn-cell .buy-btn').each((i, element) => {
                    const itens_url = $(element).attr('href');
                    all_results_url.push(itens_url);
                });	

                var tam = 5;
                if(all_results_stores.length < tam)
                    tam = all_results_stores.length;

                var all_results = '';
                for(var i = 0; i < tam; i++) {
                    var coupon_code;
                    if(all_results_coupons_exist[i] == 'Existe') coupon_code = all_results_coupons[i];
                    else coupon_code = 'No coupon available.'
                    all_results += '**Store: **' + all_results_stores[i] + '\n**Platform: **' + all_results_platform[i] + '\n**Coupon: **' + coupon_code + '\n**Price: **' + all_results_prices[i] + '€\n**URL: ** [Go to store](https:'+ all_results_url[i] + ')\n\n';
                }

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
        }).catch(function(error) {
            message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
            console.log(error);
        });		
    }			
}