import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: new Date(Date.now() + 1000 * 30) };

export const execute: JobExecute = async ({ client }) => {
	const latestChapters = await client.api.mangadex.getLatestChapters();
	const chaptersByManga = new Map(
		latestChapters
			.reverse()
			.map((manga) => [manga.mangaId, latestChapters.filter((chapter) => chapter.mangaId === manga.mangaId)]),
	);

	const embeds = [];
	for (const [mangaId, chapters] of chaptersByManga) {
		for (const { chapter } of chapters) {
			const isSuccessful = await client.state({ title: `${mangaId}:${chapter.id}`, url: chapter.url });
			if (!isSuccessful) continue;

			const chapterIndex = chapters.findIndex((currentChapter) => currentChapter.chapter.id === chapter.id);
			chapters.splice(chapterIndex);
			break;
		}
		if (chapters.length === 0) continue;

		const { title, url, image, publication, tags, contentRating } = await client.api.mangadex.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = chapters
			.slice(0, 10)
			.reverse()
			.map(({ chapter }) => `**[${chapter.title}](${chapter.url})**`);
		const hiddenChaptersCount = chapters.length - formattedChapters.length;
		if (hiddenChaptersCount > 0) formattedChapters.push(`And ${hiddenChaptersCount} more!`);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.addFields([
				{
					name: `**${t('jobs.manga.embed.fields.0.name')}**`,
					value: publication,
				},
				{
					name: `**${t('jobs.manga.embed.fields.1.name')}**`,
					value: contentRating ?? t('common.unavailable'),
					inline: true,
				},
				{
					name: `**${t('jobs.manga.embed.fields.2.name')}**`,
					value: tags.map((tag) => `\`${tag}\``).join(),
					inline: true,
				},
				{
					name: `**${t('jobs.manga.embed.fields.3.name')}**`,
					value: formattedChapters.join('\n'),
				},
			])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Manga', embeds });
};
