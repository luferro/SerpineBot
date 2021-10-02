const hltb = require('howlongtobeat');
const { erase } = require('../utils/message');

const hltbService = new hltb.HowLongToBeatService();

module.exports = {
	name: 'howlongtobeat',
    async getHowLongToBeat(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ');
        if(!query) return message.channel.send('./cmd hltb');
        try {
            const data = await hltbService.search(query);
            if(data.length === 0) return message.channel.send(`Couldn't find a match for ${query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const hasPlaytimes =  data[0].gameplayMain > 0 || data[0].gameplayMainExtra > 0 || data[0].gameplayCompletionist > 0;
            if(!hasPlaytimes) return message.channel.send(`Closest match to \`${query}\` is \`${data[0].name}\`. No playtimes were found.`).then(m => { m.delete({ timeout: 5000 }) });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `How long to beat \`${data[0].name}\``,
                fields: [
                    {
                        name: '**Main Story**',
                        value: data[0].gameplayMain ? `~${data[0].gameplayMain}h` : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Main Story + Extras**',
                        value: data[0].gameplayMainExtra ? `~${data[0].gameplayMainExtra}h` : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Completionist**',
                        value: data[0].gameplayCompletionist ? `~${data[0].gameplayCompletionist}h` : 'N/A',
                        inline: true
                    }
                ],
                thumbnail: {
                    url: data[0].imageUrl ? `https://howlongtobeat.com${data[0].imageUrl}` : ''
                },
                footer: {
                    text: 'Powered by HowLongToBeat'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    }
};
