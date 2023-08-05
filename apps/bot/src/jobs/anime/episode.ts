import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import { Bot } from '../../Bot';
import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */5 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	if (client.cache.anime.schedule.size === 0) await Bot.jobs.get('anime.schedule')?.execute({ client });

	const cache = client.cache.anime.schedule.get(new Date().getDay());
	if (!cache) return;

	const embeds = [];
	for (const { id, titles, url, image, episodes, streams, isDelayed } of cache) {
		if (Date.now() < new Date(episodes.current.date).getTime() || isDelayed) continue;

		const title = `${StringUtil.truncate(titles.default, 240)} - Episode ${episodes.current.number}`;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const { score, season, trackers } = await client.api.anime.schedule.getAnimeById(id);

		const formattedTracking = trackers?.map(({ tracker, url }) => `> **[${translate(tracker)}](${url})**`);
		const formattedStreams = streams?.map(({ stream, url }) => `> **[${translate(stream)}](${url})**`);

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(season ? `*${season}*` : null)
			.setThumbnail(image)
			.addFields([
				{
					name: '**Alternative title**',
					value: titles.alternative ?? 'N/A',
				},
				{
					name: '**Total**',
					value: episodes.total ? `${episodes.total} episodes` : 'N/A',
					inline: true,
				},
				{
					name: '**Duration**',
					value: episodes.duration ? `${episodes.duration} min per episode` : 'N/A',
					inline: true,
				},
				{
					name: '**Score**',
					value: score?.toString() ?? 'N/A',
					inline: true,
				},
				{
					name: '**Where to watch?**',
					value: formattedStreams.join('\n') || 'N/A',
					inline: true,
				},
				{
					name: '**Where to track?**',
					value: formattedTracking.join('\n') || 'N/A',
					inline: true,
				},
			])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Anime', embeds });
};

const translate = (name: string) => {
	if (name === 'mal') return 'MyAnimeList';
	if (name === 'hidive') return name.toUpperCase();
	return StringUtil.capitalize(name);
};
