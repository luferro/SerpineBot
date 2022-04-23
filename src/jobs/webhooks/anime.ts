import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as JikanMoe from '../../apis/jikanMoe';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';

export const data = {
	name: 'anime',
	schedule: '0 */15 * * * *',
};

export const execute = async (client: Bot) => {
	const aggregatorsList = [
		{ name: 'Kitsu', url: 'kitsu.io' },
		{ name: 'AniList', url: 'anilist.co' },
		{ name: 'MyAnimeList', url: 'myanimelist.net' },
		{ name: 'Anime-Planet', url: 'www.anime-planet.com' },
	];

	const streamsList = [
		{ name: 'VRV', url: 'vrv.co' },
		{ name: 'HIDIVE', url: 'www.hidive.com' },
		{ name: 'Netflix', url: 'www.netflix.com' },
		{ name: 'AnimeLab', url: 'www.animelab.com' },
		{ name: 'Crunchyroll', url: 'crunchyroll.com' },
	];

	const {
		0: {
			data: { title, url, selftext },
		},
	} = await Reddit.getPostsByFlair('Anime', 'new', ['Episode']);

	const hasEntry = await client.manageState('Anime', 'Episodes', title, url);
	if (hasEntry) return;

	const streams = streamsList
		.map((item) => {
			const stream = selftext?.split('\n').find((nestedItem) => nestedItem.includes(item.url));
			if (!stream) return;

			return `> **[${item.name}](${stream.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
		})
		.filter((item): item is NonNullable<typeof item> => !!item);

	const aggregators = aggregatorsList
		.map((item) => {
			const aggregator = selftext?.split('\n').find((nestedItem) => nestedItem.includes(item.url));
			if (!aggregator) return;

			return `> **[${item.name}](${aggregator.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
		})
		.filter((item): item is NonNullable<typeof item> => !!item);

	const myAnimeListAgg = aggregators.find((item) => item?.includes('myanimelist.net'));
	const id = myAnimeListAgg?.match(/\((.*?)\)/g)?.[0].match(/\d+/g)?.[0];
	if (!id) return;

	const { episodes, score, image } = await JikanMoe.getAnimeById(id);

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, 'Anime');
		if (!webhook) continue;

		await webhook.send({
			embeds: [
				new MessageEmbed()
					.setTitle(StringUtil.truncate(title.replace(/Discussion|discussion/, '')))
					.setURL(url)
					.setThumbnail(image ?? '')
					.addField('**Streams**', streams.length > 0 ? streams.join('\n') : 'N/A')
					.addField('**Trackers**', aggregators.length > 0 ? aggregators.join('\n') : 'N/A')
					.addField('**Total episodes**', episodes?.toString() ?? 'N/A', true)
					.addField('**Score**', score?.toString() ?? 'N/A', true)
					.setColor('RANDOM'),
			],
		});
	}
};
