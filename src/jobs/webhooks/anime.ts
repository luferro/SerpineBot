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

const AGGREGATORS_LIST = [
	{ name: 'Kitsu', url: 'kitsu.io' },
	{ name: 'AniList', url: 'anilist.co' },
	{ name: 'MyAnimeList', url: 'myanimelist.net' },
	{ name: 'Anime-Planet', url: 'www.anime-planet.com' },
];

const STREAMS_LIST = [
	{ name: 'VRV', url: 'vrv.co' },
	{ name: 'HIDIVE', url: 'www.hidive.com' },
	{ name: 'Netflix', url: 'www.netflix.com' },
	{ name: 'AnimeLab', url: 'www.animelab.com' },
	{ name: 'Crunchyroll', url: 'crunchyroll.com' },
];

export const execute = async (client: Bot) => {
	const {
		0: {
			data: { title, url, selftext },
		},
	} = await Reddit.getPostsByFlair('Anime', 'new', ['Episode']);

	const hasEntry = await client.manageState('Anime', 'Episodes', title, url);
	if (hasEntry) return;

	const streams = STREAMS_LIST.map(({ name, url }) => {
		const stream = selftext?.split('\n').find((text) => text.includes(url));
		if (!stream) return;

		return `> **[${name}](${stream.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
	}).filter((stream): stream is NonNullable<typeof stream> => !!stream);

	const aggregators = AGGREGATORS_LIST.map(({ name, url }) => {
		const aggregator = selftext?.split('\n').find((text) => text.includes(url));
		if (!aggregator) return;

		return `> **[${name}](${aggregator.match(/(?<=\()(.*)(?=\))/g)![0]})**`;
	}).filter((aggregator): aggregator is NonNullable<typeof aggregator> => !!aggregator);

	const malAggregator = aggregators.find((aggregator) => aggregator?.includes('myanimelist.net'));
	const id = malAggregator?.match(/\((.*?)\)/g)?.[0].match(/\d+/g)?.[0];
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
					.addField('**Streams**', streams.join('\n') || 'N/A')
					.addField('**Trackers**', aggregators.join('\n') || 'N/A')
					.addField('**Total episodes**', episodes?.toString() ?? 'N/A', true)
					.addField('**Score**', score?.toString() ?? 'N/A', true)
					.setColor('RANDOM'),
			],
		});
	}
};
