const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: 'specs',
    async getGameSpecs(message, args) {
        message.delete({ timeout: 5000 });

        if(!args[1]) return message.channel.send('Usage: ./specs <game_title>').then(m => { m.delete({ timeout: 5000 }) });

        const game = args.slice(1).join(' ');

        try {
            const res_search = await fetch(`https://www.game-debate.com/search/games?search=${game}`);
            const body_search = await res_search.text();
            const $1 = cheerio.load(body_search);

            const url = $1('.advancedSearchResult .gameResultHeader').first().attr('href');
            if(!url) return message.channel.send('Couldn\'t find that game.').then(m => { m.delete({ timeout: 5000 }) });

            const res_game = await fetch(`https://www.game-debate.com${url}`);
            const body_game = await res_game.text();
            const $2 = cheerio.load(body_game);

            const title = $2('.game-title-container span').text();
            const releaseDate = $2('.game-release-date-container .game-release-date p').next().text();
            const updatedDate = $2('.devDefSysReqMinWrapper .dateUpdated').first().text();
            const minHeader = $2('.devDefSysReqMinWrapper .devDefSysReqHeader').first().text().trim();
            const recHeader = $2('.devDefSysReqRecWrapper .devDefSysReqHeader').first().text().trim();

            const minSpecs = [];
            $('.devDefSysReqMinWrapper .devDefSysReqList li').each((i, element) => {
                minSpecs.push($(element).clone().children().remove().end().text().trim());
            });	

            const recSpecs = [];
            $('.devDefSysReqRecWrapper .devDefSysReqList li').each((i, element) => {
                recSpecs.push($(element).clone().children().remove().end().text().trim());
            });
            
            if(!minSpecs) minSpecs.push('No Minimum Requirements available.');
            if(!recSpecs) recSpecs.push('No Recommended Requirements available.');

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: `Requirements found for ${game}`
                },
                title: `${title}\n\n**Release Date**: ${releaseDate}`,
                description: `${updatedDate}\n\n**${minHeader}**\n\n${minSpecs.join('\n')}\n\n**${recHeader}**\n\n${recSpecs.join('\n')}`  
            }});
        } catch (error) {
            console.log(error);
        }	
    }			
}