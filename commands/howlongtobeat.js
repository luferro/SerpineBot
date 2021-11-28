import { MessageEmbed } from 'discord.js';
import { HowLongToBeatService } from 'howlongtobeat';

const HowLongToBeat = new HowLongToBeatService();

const getHowLongToBeat = async interaction => {
    const game = interaction.options.getString('game');

    const data = await HowLongToBeat.search(game);
    if(data.length === 0) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const hasPlaytimes = data[0].gameplayMain > 0 || data[0].gameplayMainExtra > 0 || data[0].gameplayCompletionist > 0;
    if(!hasPlaytimes) return interaction.reply({ content: `Closest match to \`${game}\` is \`${data[0].name}\`. No playtimes were found for this match.`, ephemeral: true });

    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle(`How long to beat \`${data[0].name}\``)
                .setThumbnail(data[0].imageUrl ? `https://howlongtobeat.com${data[0].imageUrl}` : '')
                .addField('**Main Story**', data[0].gameplayMain ? `~${data[0].gameplayMain}h` : 'N/A', true)
                .addField('**Main Story + Extras**', data[0].gameplayMainExtra ? `~${data[0].gameplayMainExtra}h` : 'N/A', true)
                .addField('**Completionist**', data[0].gameplayCompletionist ? `~${data[0].gameplayCompletionist}h` : 'N/A', true)
                .setFooter('Powered by HowLongToBeat.')
                .setColor('RANDOM')
        ]
    });
}

export default { getHowLongToBeat };