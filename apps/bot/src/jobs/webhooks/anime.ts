import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { JikanApi } from '@luferro/jikan-api';
import { RedditApi } from '@luferro/reddit-api';
import { StringUtil } from '@luferro/shared-utils';
import * as Webhooks from '../../services/webhooks';
import { WebhookName } from '../../types/enums';

export const data = {
	name: WebhookName.Anime,
	schedule: '0 */15 * * * *',
};

enum AnimeAggregator {
	Kitsu = 'kitsu.io',
	AniList = 'anilist.co',
	MyAnimeList = 'myanimelist.net',
	AnimePlanet = 'www.anime-planet.com',
}

enum AnimeStream {
	Vrv = 'vrv.co',
	HiDive = 'www.hidive.com',
	Netflix = 'www.netflix.com',
	AnimeLab = 'www.animelab.com',
	Crunchyroll = 'crunchyroll.com',
}

export const execute = async (client: Bot) => {
	const {
		0: { title, url, selftext },
	} = await RedditApi.getPostsByFlair('Anime', 'new', ['Episode']);

	const hasEntry = await client.manageState('Anime', 'Episodes', title, url);
	if (hasEntry) return;

	const streams = Object.entries(AnimeStream)
		.map(([name, url]) => {
			const stream = selftext?.split('\n').find((text) => text.includes(url));
			if (!stream) return;

			return `> **[${name}](${stream.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
		})
		.filter((stream): stream is NonNullable<typeof stream> => !!stream);

	const aggregators = Object.entries(AnimeAggregator)
		.map(([name, url]) => {
			const aggregator = selftext?.split('\n').find((text) => text.includes(url));
			if (!aggregator) return;

			return `> **[${name}](${aggregator.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
		})
		.filter((aggregator): aggregator is NonNullable<typeof aggregator> => !!aggregator);

	const myAnimeList = aggregators.find((aggregator) => aggregator.includes(AnimeAggregator.MyAnimeList));
	const id = myAnimeList?.match(/\((.*?)\)/g)?.[0].match(/\d+/g)?.[0];
	if (!id) return;

	const { episodes, score, image, duration } = await JikanApi.getAnimeById(id);

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, 'Anime');
		if (!webhook) continue;

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

		await webhook.send({ embeds: [embed] });
	}
};
