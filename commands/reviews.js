import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { erase } from '../utils/message.js';
import { slug } from '../utils/slug.js';

const getReviews = async(message, args) => {
    erase(message, 5000);

    const query = args.slice(1).join(' ');
    if(!query) return message.channel.send({ content: './cmd reviews' });

    const { id, name } = await searchGameReviews(query);
    if(!id) return message.channel.send({ content: `Couldn't find a match for ${query}.` }).then(m => erase(m, 5000));

    const { url, title, image, releaseDate, count, score, tier, platforms } = await getGameReviewsDetails(id, name);
    if(!tier && score === -1) return message.channel.send({ content: `Couldn't find reviews for ${query}.` }).then(m => erase(m, 5000));;

    message.channel.send({
        embeds: [
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
                .setColor(Math.floor(Math.random() * 16777214) + 1)
        ]
    });
}

const searchGameReviews = async game => {
    const res = await fetch(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
    const data = await res.json();

    if(data.length === 0) return { id: null, name: null };

    return { id: data[0].id, name: slug(data[0].name) };
}

const getGameReviewsDetails = async(id, name) => {
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