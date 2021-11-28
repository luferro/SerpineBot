import { MessageEmbed, WebhookClient } from 'discord.js';
import fetch from 'node-fetch';
import { manageState } from '../handlers/webhooks.js';

const getReviews = async() => {
	const webhook = new WebhookClient({ url: process.env.WEBHOOK_REVIEWS });

    const game = await searchReviewThreads();
	if(!game) return;

	const state = manageState('reviews', game.url);
    if(!state.hasCategory || state.hasEntry) return;

	const review = await getOpencriticReview(game.id);
	if(!review) return;

	const { title, image, releaseDate, count, score, tier, platforms } = review;
	if(!tier && score === -1) return;

	webhook.send({
		embeds: [
			new MessageEmbed()
				.setTitle(title)
				.setURL(game.url)
				.setThumbnail(image || '')
				.addField('**Release date**', releaseDate)
				.addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
				.addField('**Tier**', tier ? tier.toString() : 'N/A', true)
				.addField('**Score**', score && score > 0 ? score.toString() : 'N/A', true)
				.addField('**Reviews count**', count ? count.toString() : 'N/A', true)					
				.setFooter('Powered by OpenCritic')
				.setColor('RANDOM')
		]
	});
}

const searchReviewThreads = async() => {
    const res = await fetch('https://www.reddit.com/r/Games/search.json?q=flair_name%3A%22Review%20Thread%22&restrict_sr=1&sort=new');
    if(!res.ok) return null;
    const data = await res.json();

    if(data.data.children.length === 0) return null;

    const selftext = data.data.children[0].data.selftext.split('\n');
    const opencritic = selftext.find(item => item.includes('https://opencritic.com/game/'));

    if(!opencritic) {
        const metacritic = selftext?.find(item => item.includes('https://www.metacritic.com/game/'));
        if(!metacritic) return null;

        const game = metacritic.split('/')[5];

        return await searchOpencritic(game);
    }

    const url = opencritic.match(/(?<=\()(.*)(?=\))/g)[0];
    const id = url.match(/\d+/g)[0];

    return { id, url };
}

const searchOpencritic = async game => {
    const res = await fetch(`https://api.opencritic.com/api/meta/search?criteria=${game}`);
	if(!res.ok) return null;
    const data = await res.json();

    return { id: data[0].id, url: `https://opencritic.com/game/${data[0].id}/${game}` };
}

const getOpencriticReview = async id => {
	const res = await fetch(`https://api.opencritic.com/api/game/${id}`);
    if(!res.ok) return null;
	const data = await res.json();

	const platforms = data.Platforms.map(platform => `> ${platform.name}`);

	return {
		title: data.name,
		image: data.bannerScreenshot ? `https:${data.bannerScreenshot.fullRes}` : null,
		releaseDate: data.firstReleaseDate.split('T')[0],
		count: data.numReviews,
		score: Math.round(data.topCriticScore),
		tier: data.tier,
		platforms
	}
}

export default { getReviews };