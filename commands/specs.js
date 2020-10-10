const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'specs',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send("Usage: ./specs game_title").then(m => {m.delete({ timeout: 5000 })});;

        let argsspecs = args.slice(1).join(" ");

        got('https://www.game-debate.com/search/games?search='+argsspecs).then(response => {
            var $ = cheerio.load(response.body);

            let all_results_href = [];
            $('.advancedSearchResult .gameResultHeader').each((i, element) => {
                const itens_href = $(element).attr('href');
                all_results_href.push(itens_href);
            });	

            if(!all_results_href[0]) return message.channel.send("Couldn't find that game.").then(m => {m.delete({ timeout: 5000 })});

            got('https://www.game-debate.com'+all_results_href[0]).then(response => {
                var $ = cheerio.load(response.body);

                let all_results_specs_m = [];
                $('.devDefSysReqMinWrapper .devDefSysReqList li').each((i, element) => {
                    const itens_specs_low = $(element).clone().children().remove().end().text().trim();
                    all_results_specs_m.push(itens_specs_low);
                });	

                let all_results_specs_r = [];
                $('.devDefSysReqRecWrapper .devDefSysReqList li').each((i, element) => {
                    const itens_specs_high = $(element).clone().children().remove().end().text().trim();
                    all_results_specs_r.push(itens_specs_high);
                });

                let release_date_game = [];
                $('.game-release-date-container .game-release-date p').each((i, element) => {
                    const itens_release = $(element).text();
                    release_date_game.push(itens_release);
                });
                
                let all_results_specs_min = '';
                for(let i = 0; i < all_results_specs_m.length; i++) {
                    all_results_specs_min += all_results_specs_m[i] + '\n';
                }

                let all_results_specs_max = '';
                for(let i = 0; i < all_results_specs_r.length; i++) {
                    all_results_specs_max += all_results_specs_r[i] + '\n';
                }

                if(!all_results_specs_min) all_results_specs_min = 'No Minimum Requirements available.';
                if(!all_results_specs_max) all_results_specs_max = 'No Recommended Requirements available.';

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: "Requirements found for " + argsspecs
                    },
                    title: $('.game-title-container span').text() + '\n\n**Release Date**: ' + release_date_game[1],
                    description:  $('.devDefSysReqMinWrapper .dateUpdated').first().text() + '\n\n' 
                                + $('.devDefSysReqMinWrapper .devDefSysReqHeader').first().text().trim() + '\n\n' 
                                + all_results_specs_min + '\n\n' 
                                + $('.devDefSysReqRecWrapper .devDefSysReqHeader').first().text().trim() + '\n\n' 
                                + all_results_specs_max
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