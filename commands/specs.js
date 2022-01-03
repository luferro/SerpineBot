import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';

const getSpecs = async interaction => {
    const game = interaction.options.getString('game');

    const specs = await searchSpecs(game);
    if(!specs) return interaction.reply({ content: `Couldn\'t find a match for ${game}.`, ephemeral: true })

    const data = await fetchData(specs.url);
    const $ = load(data);

    const releaseDate = $('.game-release-date-container .game-release-date p').next().text().trim();
    const updatedDate = $('.devDefSysReqMinWrapper .dateUpdated').first().text().split('-')[0].trim();

    const minSpecs = $('.devDefSysReqMinWrapper .devDefSysReqList li').get().map(element => {
        const line = $(element).clone().children().remove().end().text().trim();
        const category = line.includes(':') ? line.slice(0, line.indexOf(':')).trim() : null;
        const requirement = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : null;

        return category && requirement ? `**${category}**: ${requirement}` : line;
    });
    if(minSpecs.length === 0) minSpecs.push('No minimum requirements available.');

    const recSpecs = $('.devDefSysReqRecWrapper .devDefSysReqList li').get().map(element => {
        const line = $(element).clone().children().remove().end().text().trim();
        const category = line.includes(':') ? line.slice(0, line.indexOf(':')).trim() : null;
        const requirement = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : null;
        
        return category && requirement ? `**${category}**: ${requirement}` : line;
    });
    if(recSpecs.length === 0) recSpecs.push('No recommended requirements available.');

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Requirements found for \`${specs.name}\``)
            .setDescription(`
                \n**Release Date:** ${(releaseDate.length > 0 && releaseDate) || 'N/A'}
                \n**Specs updated:** ${(updatedDate.length > 0 && updatedDate) || 'N/A'}
                \n**Minimum requirements**\n${minSpecs.join('\n')}
                \n**Recommended requirements**\n${recSpecs.join('\n')}
            `)
            .setThumbnail(specs.image || '')
            .setFooter('Powered by Game-Debate.')
            .setColor('RANDOM')
    ]});
}

const searchSpecs = async game => {
    const data = await fetchData(`https://www.game-debate.com/search/games?t=games&query=${game}`);
    const $ = load(data);

    const name = $('.search-results-body .search-result-detail h2').first().text();
    const href = $('.search-results-body a').first().attr('href');
    const image = $('.search-results-body .search-result-image img').first().attr('src');

    if(!href) return null;

    return { name, url: `https://www.game-debate.com${specs.url}`, image };
}

export default { getSpecs };