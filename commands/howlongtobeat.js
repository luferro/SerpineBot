import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';

const getHowLongToBeat = async interaction => {
    const game = interaction.options.getString('game');

    const { name, image, playtimeMain, playtimeMainExtra, playtimeCompletionist } = await searchGame(game);
    if(name.length === 0) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

    const hasPlaytimes = playtimeMain || playtimeMainExtra || playtimeCompletionist;
    if(!hasPlaytimes) return interaction.reply({ content: `Closest match to \`${game}\` is \`${name}\`. No playtimes were found for this match.`, ephemeral: true });

    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle(`How long to beat \`${name}\``)
                .setThumbnail(image || '')
                .addField('**Main Story**', playtimeMain ? `~${playtimeMain}` : 'N/A', true)
                .addField('**Main Story + Extras**', playtimeMainExtra ? `~${playtimeMainExtra}` : 'N/A', true)
                .addField('**Completionist**', playtimeCompletionist ? `~${playtimeCompletionist}` : 'N/A', true)
                .setFooter('Powered by HowLongToBeat.')
                .setColor('RANDOM')
        ]
    });
}

export const searchGame = async game => {
    const parseTime = text => {
        if(!/\d+/.test(text)) return null;

        const [time, unit] = text.split(' ');
        if(unit === 'Mins') return `${time}m`;
        if(time.includes('½')) return `${parseInt(time.substring(0, time.indexOf('½'))) + 0.5}h`;
        return `${time}h`;
    }

    const formData = new URLSearchParams();
    formData.append('queryString', game);
    formData.append('t', 'games');
    formData.append('sorthead', 'popular');
    formData.append('sortd', 'Normal Order');
    formData.append('plat', '');
    formData.append('length_type', 'main');
    formData.append('length_min', '');
    formData.append('length_max', '');
    formData.append('detail', '0');

    const data = await fetchData('https://howlongtobeat.com/search_results?page=1', 'POST', formData);
    const $ = load(data);

    const name = $('ul').first().find('li').first().find('h3 a').text();
    const src = $('ul').first().find('li').first().find('img').attr('src');
    const image = `https://howlongtobeat.com${src}`;

    const playtimes = { main: null, mainExtra: null, completionist: null };
    for(const element of $('.search_list_details_block').first().find('div').get()) {
        const label = $(element).text();
        if(label.startsWith('Main Story') || label.startsWith('Single-Player') || label.startsWith('Solo')) playtimes.main = parseTime($(element).next().text());
        if(label.startsWith('Main + Extra') || label.startsWith('Co-Op')) playtimes.mainExtra = parseTime($(element).next().text());
        if(label.startsWith('Completionist') || label.startsWith('Vs.')) playtimes.completionist = parseTime($(element).next().text());   
    }
    
    return { name, image, playtimeMain: playtimes.main, playtimeMainExtra: playtimes.mainExtra, playtimeCompletionist: playtimes.completionist };
}

export default { getHowLongToBeat };