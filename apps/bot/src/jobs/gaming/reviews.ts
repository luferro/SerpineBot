import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const interval = { start: Date.now() };
	const results = await client.scraper.searchEngine.search({ query: 'reviews site:opencritic.com/game', interval });
	const reviews = results
		.map((result) => {
			const matches = result.url.match(/https?:\/\/opencritic.com\/game\/\d+\/(\w|-)+/);
			if (!matches) return;

			return { name: result.name, url: matches[0] };
		})
		.filter((item): item is NonNullable<typeof item> => !!item);

	const embeds = [];
	for (const review of reviews.reverse()) {
		const data = await client.api.gaming.reviews.getReviewsForUrl({ url: review.url });
		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } = data;
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
					name: t('jobs.gaming.reviews.embed.fields.0.name'),
					value: releaseDate ?? t('jobs.gaming.reviews.embed.fields.0.value'),
				},
				{
					name: t('jobs.gaming.reviews.embed.fields.1.name'),
					value: platforms.join('\n') || t('common.unavailable'),
				},
				{
					name: t('jobs.gaming.reviews.embed.fields.2.name'),
					value: score ?? t('common.unavailable'),
					inline: true,
				},
				{
					name: t('jobs.gaming.reviews.embed.fields.3.name'),
					value: count ?? t('common.unavailable'),
					inline: true,
				},
				{
					name: t('jobs.gaming.reviews.embed.fields.4.name'),
					value: recommended ?? t('common.unavailable'),
					inline: true,
				},
			])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Reviews', embeds });
};
