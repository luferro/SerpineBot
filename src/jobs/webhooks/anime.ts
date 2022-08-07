import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as JikanMoe from '../../apis/jikanMoe';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import { AnimeAggregator, AnimeStream, WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Anime,
	schedule: '0 */15 * * * *',
};

export const execute = async (client: Bot) => {
	const {
		0: {
			data: { title, url, selftext },
		},
	} = await Reddit.getPostsByFlair('Anime', 'new', ['Episode']);

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

	const { episodes, score, image, duration } = await JikanMoe.getAnimeById(id);

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Anime);
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
