import { WebhookEnum } from '@luferro/database';
import { JikanApi } from '@luferro/jikan-api';
import { RedditApi } from '@luferro/reddit-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

enum Aggregator {
	Kitsu = 'kitsu.io',
	AniList = 'anilist.co',
	MyAnimeList = 'myanimelist.net',
	AnimePlanet = 'www.anime-planet.com',
}

enum Stream {
	Vrv = 'vrv.co',
	HiDive = 'www.hidive.com',
	Netflix = 'www.netflix.com',
	AnimeLab = 'www.animelab.com',
	Crunchyroll = 'crunchyroll.com',
}

export const data: JobData = {
	name: JobName.Anime,
	schedule: '0 */20 * * * *',
};

export const execute = async (client: Bot) => {
	const posts = await RedditApi.getPostsByFlair('Anime', 'new', ['Episode'], 20);

	for (const { title, url, selftext } of posts.reverse()) {
		const { isDuplicated } = await client.manageState(data.name, null, title, url);
		if (isDuplicated) continue;

		const streams = findSelftextMatches(selftext, Object.entries(Stream));
		const aggregators = findSelftextMatches(selftext, Object.entries(Aggregator));

		const id = getIdFromAggregator(aggregators, Aggregator.MyAnimeList);
		if (!id) continue;

		const { episodes, score, image, duration } = await JikanApi.getAnimeById(id);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title.replace(/Discussion|discussion/, '')))
			.setURL(url)
			.setThumbnail(image)
			.addFields([
				{
					name: '**Where to watch?**',
					value: streams.join('\n') || 'N/A',
					inline: true,
				},
				{
					name: '**Where to track?**',
					value: aggregators.join('\n') || 'N/A',
					inline: true,
				},
				{
					name: '**Total episodes**',
					value: episodes?.toString() ?? 'N/A',
				},
				{
					name: '**Episode duration**',
					value: duration?.toString() ?? 'N/A',
				},
				{
					name: '**Score**',
					value: score?.toString() ?? 'N/A',
				},
			])
			.setColor('Random');

		await client.sendWebhookMessageToGuilds(WebhookEnum.Anime, embed);
	}
};

const getIdFromAggregator = (aggregatorsList: string[], selectedAggregator: Aggregator) => {
	const aggregator = aggregatorsList.find((aggregator) => aggregator.includes(selectedAggregator));
	return aggregator?.match(/\((.*?)\)/g)?.[0].match(/\d+/g)?.[0] ?? null;
};

const findSelftextMatches = (selftext: string | null, array: [string, Aggregator | Stream][]) => {
	return array
		.map(([key, value]) => {
			const stream = selftext?.split('\n').find((text) => text.includes(value));
			if (!stream) return;

			return `> **[${key}](${stream.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
		})
		.filter((entry): entry is NonNullable<typeof entry> => !!entry);
};
