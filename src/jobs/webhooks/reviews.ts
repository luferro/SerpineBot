import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as OpenCritic from '../../apis/opencritic';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Reviews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const {
		0: {
			data: { selftext },
		},
	} = await Reddit.getPostsByFlair('Games', 'new', ['Review Thread']);

	const selftextArray = selftext?.split('\n') ?? [];

	const opencriticMatch = selftextArray.find((text) => text.includes('https://opencritic.com/game/'));
	const opencriticUrl = opencriticMatch?.match(/(?<=\()(.*)(?=\))/g)?.[0];
	const opencriticId = opencriticUrl?.match(/\d+/g)?.[0];

	const metacriticMatch = selftextArray.find((text) => text.includes('https://www.metacritic.com/game/'));
	const metacriticSlug = metacriticMatch?.split('/')[5];

	const id = opencriticId ?? (metacriticSlug && (await OpenCritic.search(metacriticSlug)));
	if (!id) return;

	const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
		await OpenCritic.getReviewById(id);
	if (!tier && !score) return;

	const hasEntry = await client.manageState('Reviews', 'Opencritic', name, url);
	if (hasEntry) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Reviews);
		if (!webhook) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(name))
			.setURL(url)
			.setThumbnail(image)
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
					name: '**Tier**',
					value: tier?.toString() ?? 'N/A',
				},
				{
					name: '**Score**',
					value: score?.toString() ?? 'N/A',
					inline: true,
				},
				{
					name: '**Reviews count**',
					value: count?.toString() ?? 'N/A',
					inline: true,
				},
				{
					name: '**Critics Recommended**',
					value: recommended ? `${recommended}%` : 'N/A',
					inline: true,
				},
			])
			.setColor('Random');

		await webhook.send({ embeds: [embed] });
	}
};
