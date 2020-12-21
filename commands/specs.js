const cheerio = require('cheerio');
const got = require('got');

const specs = [];

module.exports = {
    name: 'specs',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send('Usage: ./specs <game_title>').then(m => { m.delete({ timeout: 5000 }) });

        let argsspecs = args.slice(1).join(' ');

        got(`https://www.game-debate.com/search/games?search=${argsspecs}`).then(response => {
            var $ = cheerio.load(response.body);

            let url = $('.advancedSearchResult .gameResultHeader').first().attr('href');
            if(!url) return message.channel.send("Couldn't find that game.").then(m => { m.delete({ timeout: 5000 }) });

            got(`https://www.game-debate.com${url}`).then(response => {
                var $ = cheerio.load(response.body);

                let title = $('.game-title-container span').text();
                let releaseDate = $('.game-release-date-container .game-release-date p').next().text();
                let updatedDate = $('.devDefSysReqMinWrapper .dateUpdated').first().text();
                let minHeader = $('.devDefSysReqMinWrapper .devDefSysReqHeader').first().text().trim();
                let recHeader = $('.devDefSysReqRecWrapper .devDefSysReqHeader').first().text().trim();

                let minSpecs = [];
                $('.devDefSysReqMinWrapper .devDefSysReqList li').each((i, element) => {
                    minSpecs.push($(element).clone().children().remove().end().text().trim());
                });	

                let recSpecs = [];
                $('.devDefSysReqRecWrapper .devDefSysReqList li').each((i, element) => {
                    recSpecs.push($(element).clone().children().remove().end().text().trim());
                });
                

                if(!minSpecs) minSpecs.push('No Minimum Requirements available.');
                if(!recSpecs) recSpecs.push('No Recommended Requirements available.');

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: "Requirements found for " + argsspecs
                    },
                    title: `${title}\n\n**Release Date**: ${releaseDate}`,
                    description: `${updatedDate}\n\n**${minHeader}**\n\n${minSpecs.join('\n')}\n\n**${recHeader}**\n\n${recSpecs.join('\n')}`  
                }})
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });		
    }			
}