import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const [date] = new Date().toISOString().split('T');
	const results = (await client.api.google.engine.search(`reviews site:opencritic.com/game after:${date}`)).map(
		(result) => {
			const [url] = result.url.match(/https?:\/\/opencritic.com\/game\/\d+\/(\w|-)+/)!;
			return { name: result.name, url };
		},
	);

	const embeds = [];
	for (const result of results.reverse()) {
		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
			await client.api.gaming.reviews.getReviewsForUrl(result.url);
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
