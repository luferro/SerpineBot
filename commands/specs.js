const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: 'specs',
    async getGameSpecs(message, args) {
        message.delete({ timeout: 5000 });

        const game_query = args.slice(1).join(' ');
        if(!game_query) return message.channel.send('Usage: ./specs <Game title>').then(m => { m.delete({ timeout: 5000 }) });
        try {
            const url = await this.searchGameSpecs(game_query);
            if(!url) return message.channel.send('Couldn\'t find that game.').then(m => { m.delete({ timeout: 5000 }) });

            const res = await fetch(`https://www.game-debate.com${url}`);
            const html = await res.text();
            const $ = cheerio.load(html);

            const title = $('.game-title-container span').text();
            const releaseDate = $('.game-release-date-container .game-release-date p').next().text();
            const updatedDate = $('.devDefSysReqMinWrapper .dateUpdated').first().text();

            const minSpecs = [];
            $('.devDefSysReqMinWrapper .devDefSysReqList li').each((i, element) => {
                minSpecs.push($(element).clone().children().remove().end().text().trim());
            });	

            const recSpecs = [];
            $('.devDefSysReqRecWrapper .devDefSysReqList li').each((i, element) => {
                recSpecs.push($(element).clone().children().remove().end().text().trim());
            });
            
            if(minSpecs.length === 0) minSpecs.push('No Minimum Requirements available.');
            if(recSpecs.length === 0) recSpecs.push('No Recommended Requirements available.');

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: `Requirements found for ${game_query}`
                },
                title: `${title}\n\n**Release Date**: ${releaseDate}`,
                description: `
                    ${updatedDate}
                    \n
                    **Minimum**\n\n${minSpecs.join('\n')}
                    \n
                    **Recommended**\n\n${recSpecs.join('\n')}
                `  
            }});
        } catch (error) {
            console.log(error);
        }	
    },
    async searchGameSpecs(game) {
        const res = await fetch(`https://www.game-debate.com/search/games?search=${game}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        return $('.advancedSearchResult .gameResultHeader').first().attr('href');
    }	
}