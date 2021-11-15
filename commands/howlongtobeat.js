import { MessageEmbed } from 'discord.js';
import { HowLongToBeatService } from 'howlongtobeat';
import { erase } from '../utils/message.js';

const hltbService = new HowLongToBeatService();

const getHowLongToBeat = async(message, args) => {
    erase(message, 5000);

    const query = args.slice(1).join(' ');
    if(!query) return message.channel.send({ content: './cmd hltb' });

    const data = await hltbService.search(query);
    if(data.length === 0) return message.channel.send({ content: `Couldn't find a match for ${query}.` }).then(m => erase(m, 5000));

    const hasPlaytimes = data[0].gameplayMain > 0 || data[0].gameplayMainExtra > 0 || data[0].gameplayCompletionist > 0;
    if(!hasPlaytimes) return message.channel.send({ content: `Closest match to \`${query}\` is \`${data[0].name}\`. No playtimes were found.` }).then(m => erase(m, 5000));

    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle(`How long to beat \`${data[0].name}\``)
                .setThumbnail(data[0].imageUrl ? `https://howlongtobeat.com${data[0].imageUrl}` : '')
                .addField('**Main Story**', data[0].gameplayMain ? `~${data[0].gameplayMain}h` : 'N/A', true)
                .addField('**Main Story + Extras**', data[0].gameplayMainExtra ? `~${data[0].gameplayMainExtra}h` : 'N/A', true)
                .addField('**Completionist**', data[0].gameplayCompletionist ? `~${data[0].gameplayCompletionist}h` : 'N/A', true)
                .setFooter('Powered by HowLongToBeat.')
                .setColor(Math.floor(Math.random() * 16777214) + 1)
        ]
    });
}

export default { getHowLongToBeat };