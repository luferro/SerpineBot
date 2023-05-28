import { Webhook } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Reviews,
	schedule: '0 */30 * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const posts = await client.api.reddit.getPostsByFlair('Games', ['Review Thread'], 'new', 20);

	const embeds = [];
	for (const { selftext } of posts.reverse()) {
		const selftextArray = selftext?.split('\n') ?? [];

		const opencriticMatch = selftextArray.find((text) => text.includes('https://opencritic.com/game/'));
		const opencriticUrl = opencriticMatch?.match(/(?<=\()(.*)(?=\))/g)?.[0];
		const id = opencriticUrl?.match(/\d+/g)?.[0];
		if (!id) continue;

		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
			await client.api.gaming.opencritic.getReviewById(id);
		if (!tier || !score) continue;

		const isSuccessful = await client.state.entry({ job: data.name, data: { title: name, url } }).update();
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
