import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { slug } from '../utils/slug.js';

const getReviews = async interaction => {
    const game = interaction.options.getString('game');

    const { id, name } = await searchReviews(game);
    if(!id) return interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true })

    const { url, title, image, releaseDate, count, score, tier, platforms } = await getReviewsDetails(id, name);
    if(!tier && score === -1) return interaction.reply({ content: `Couldn't find reviews for ${game}.`, ephemeral: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setThumbnail(image || '')
            .addField('**Release date**', releaseDate?.toString() || 'N/A')
            .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
            .addField('**Tier**', tier?.toString() || 'N/A', true)
            .addField('**Score**', (score > 0 && score?.toString()) || 'N/A', true)
            .addField('**Reviews count**', count.toString() || 'N/A', true)
            .setFooter('Powered by OpenCritic.')
            .setColor('RANDOM')
    ]});
}

const searchReviews = async game => {
    const res = await fetch(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
    const data = await res.json();

    if(data.length === 0) return { id: null, name: null };

    return { id: data[0].id, name: slug(data[0].name) };
}

const getReviewsDetails = async(id, name) => {
    const res = await fetch(`https://api.opencritic.com/api/game/${id}`);
    const data = await res.json();

    return {
        url: `https://opencritic.com/game/${id}/${name}`,
        title: data.name,
        image: data.bannerScreenshot ? `https:${data.bannerScreenshot.fullRes}` : null,
        releaseDate: data.firstReleaseDate.split('T')[0],
        count: data.numReviews,
        score: Math.round(data.topCriticScore),
        tier: data.tier,
        platforms: data.Platforms.map(platform => `> ${platform.name}`)
    };
}

export default { getReviews };