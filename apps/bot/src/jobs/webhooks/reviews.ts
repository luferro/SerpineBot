import { WebhookEnum } from '@luferro/database';
import { OpenCriticApi } from '@luferro/games-api';
import { RedditApi } from '@luferro/reddit-api';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Reviews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const posts = await RedditApi.getPostsByFlair('Games', 'new', ['Review Thread'], 20);

	for (const { selftext } of posts.reverse()) {
		const selftextArray = selftext?.split('\n') ?? [];

		const opencriticMatch = selftextArray.find((text) => text.includes('https://opencritic.com/game/'));
		const opencriticUrl = opencriticMatch?.match(/(?<=\()(.*)(?=\))/g)?.[0];
		const opencriticId = opencriticUrl?.match(/\d+/g)?.[0];

		const metacriticMatch = selftextArray.find((text) => text.includes('https://www.metacritic.com/game/'));
		const metacriticSlug = metacriticMatch?.split('/')[5];

		const id = opencriticId ?? (metacriticSlug && (await OpenCriticApi.search(metacriticSlug)).id);
		if (!id) continue;

		const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
			await OpenCriticApi.getReviewById(id);
		if (!tier || !score) continue;

		const { isDuplicated } = await client.manageState(data.name, null, name, url);
		if (isDuplicated) continue;

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

		await client.sendWebhookMessageToGuilds(WebhookEnum.Reviews, embed);
	}
};
