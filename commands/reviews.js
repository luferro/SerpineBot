import { MessageEmbed } from 'discord.js';
import { slug } from '../utils/slug.js';
import { fetchData } from '../utils/fetch.js';

const getReviews = async interaction => {
    const game = interaction.options.getString('game');

    const id = await searchReviews(game);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true })

    const { name, url, releaseDate, image, count, score, tier, platforms } = await getReviewsDetails(id);
    if(!tier && score === -1) return interaction.reply({ content: `Couldn't find reviews for ${game}.`, ephemeral: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(url)
            .setThumbnail(image || '')
            .addField('**Release date**', releaseDate?.toString() || 'N/A')
            .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
            .addField('**Tier**', tier?.toString() || 'N/A', true)
            .addField('**Score**', score?.toString() || 'N/A', true)
            .addField('**Reviews count**', count.toString() || 'N/A', true)
            .setFooter('Powered by OpenCritic.')
            .setColor('RANDOM')
    ]});
}

const searchReviews = async game => {
    const data = await fetchData(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
    return data[0]?.id;
}

const getReviewsDetails = async id => {
    const data = await fetchData(`https://api.opencritic.com/api/game/${id}`);
    const { name, bannerScreenshot, firstReleaseDate, numReviews, topCriticScore, tier, Platforms: platformsArray } = data;

    const platforms = platformsArray.map(platform => `> ${platform.name}`);

    return {
        name,
        url: `https://opencritic.com/game/${id}/${slug(name)}`,
        releaseDate: firstReleaseDate.split('T')[0],
        image: bannerScreenshot ? `https:${bannerScreenshot.fullRes}` : null,
        count: numReviews,
        score: Math.round(topCriticScore),
        tier,
        platforms
    };
}

export default { getReviews };