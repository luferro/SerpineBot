import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const interval = { start: Date.now() };
	const results = await client.scraper.searchEngine.search({ query: `reviews site:opencritic.com/game`, interval });
	const reviews = results.map((result) => {
		const [url] = result.url.match(/https?:\/\/opencritic.com\/game\/\d+\/(\w|-)+/)!;
		return { name: result.name, url };
	});

	const embeds = [];
	for (const review of reviews.reverse()) {
		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
			await client.api.gaming.reviews.getReviewsForUrl(review.url);
		if (!tier || !score) continue;

		const isSuccessful = await client.state({ title: name, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(name)
			.setURL(url)
			.setThumbnail(tier)
			.setImage(image)
			.addFields([
				{
					name: '**Release date**',
					value: releaseDate ?? 'Soon',
				},
				{
					name: '**Available on**',
					value: platforms.join('\n') || 'N/A',
				},
				{
					name: '**Score**',
					value: score ?? 'N/A',
					inline: true,
				},
				{
					name: '**Reviews count**',
					value: count ?? 'N/A',
					inline: true,
				},
				{
					name: '**Critics Recommended**',
					value: recommended ?? 'N/A',
					inline: true,
				},
			])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Reviews', embeds });
};
