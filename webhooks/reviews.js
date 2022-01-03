import { MessageEmbed } from 'discord.js';
import { fetchData } from '../utils/fetch.js';
import { formatTitle } from '../utils/format.js';
import { getWebhook, manageState } from '../handlers/webhooks.js';

const getReviews = async client => {
	const game = await getLatestRedditReviewThread();
	if(!game) return;

	for(const [guildID, guild] of client.guilds.cache) {
		const webhook = await getWebhook(client, guild, 'Reviews');
		if(!webhook) continue;

		const data = await fetchData(`https://api.opencritic.com/api/game/${game.id}`);
		const { name, bannerScreenshot, firstReleaseDate, numReviews, topCriticScore, tier, Platforms: platformsArray } = data;

		const score = Math.round(topCriticScore);
		const image = bannerScreenshot ? `https:${bannerScreenshot.fullRes}` : null;
		const releaseDate = firstReleaseDate.split('T')[0];
		const platforms = platformsArray.map(platform => `> ${platform.name}`);

		if(!tier && score === -1) continue;

		const state = manageState('Reviews', { title: name, url: game.url });
		if(state.hasEntry) continue;

		webhook.send({ embeds: [
			new MessageEmbed()
				.setTitle(formatTitle(name))
				.setURL(game.url)
				.setThumbnail(image || '')
				.addField('**Release date**', releaseDate)
				.addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
				.addField('**Tier**', tier ? tier.toString() : 'N/A', true)
				.addField('**Score**', score && score > 0 ? score.toString() : 'N/A', true)
				.addField('**Reviews count**', numReviews ? numReviews.toString() : 'N/A', true)					
				.setFooter('Powered by OpenCritic')
				.setColor('RANDOM')
		]});	
	}
}

const getLatestRedditReviewThread = async () => {
	const data = await fetchData('https://www.reddit.com/r/Games/search.json?q=flair_name:"Review Thread"&sort=new&restrict_sr=1');
    if(data.data.children.length === 0) return null;

    const selftext = data.data.children[0].data.selftext.split('\n');
    const opencritic = selftext.find(item => item.includes('https://opencritic.com/game/'));
	if(opencritic) {
		const url = opencritic.match(/(?<=\()(.*)(?=\))/g)[0];
		const id = url.match(/\d+/g)[0];
	
		return { id, url };
	}

	const metacritic = selftext.find(item => item.includes('https://www.metacritic.com/game/'));
	if(!metacritic) return null;

	const slug = metacritic.split('/')[5];
	const reviews = await fetchData(`https://api.opencritic.com/api/meta/search?criteria=${slug}`);

	return { id: reviews[0].id, url: `https://opencritic.com/game/${reviews[0].id}/${slug}` };
}

export default { getReviews };