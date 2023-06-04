import { Webhook } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';
import { getCategoryFromPath } from '../../utils/filename';

export const data: JobData = { schedule: '0 */30 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const posts = await client.api.reddit.getPostsByFlair('Games', ['Review Thread'], 'new', 20);

	const embeds = [];
	for (const { selftext } of posts.reverse()) {
		const selftextArray = selftext?.split('\n') ?? [];

		const opencriticUrl = selftextArray
			.find((text) => text.includes('https://opencritic.com/game/'))
			?.match(/https?[\w:/\-.]+/g)?.[0];
		if (!opencriticUrl) continue;

		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
			await client.api.gaming.opencritic.getReviewsForUrl(opencriticUrl);
		if (!tier || !score) continue;

		const isSuccessful = await client.state
			.entry({ job: getCategoryFromPath(__filename, 'jobs'), data: { title: name, url } })
			.update();
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(name)
			.setURL(url)
			.setThumbnail(tier)
			.setImage(image)
			.addFields([
				{
					name: '**Release date**',
					value: releaseDate,
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
					value: count?.toString() ?? 'N/A',
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

	await client.propageMessages(Webhook.Reviews, embeds);
};
