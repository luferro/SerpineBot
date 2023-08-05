import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const latestChapters = await client.api.mangadex.getLastestChapters();

	const chaptersByManga = new Map(
		latestChapters
			.reverse()
			.map((manga) => [manga.mangaId, latestChapters.filter((chapter) => chapter.mangaId === manga.mangaId)]),
	);

	const embeds = [];
	for (const [mangaId, chapters] of chaptersByManga) {
		for (const { chapterId, url } of chapters) {
			const isSuccessful = await client.state({ title: `${mangaId}:${chapterId}`, url });
			if (!isSuccessful) continue;

			const chapterIndex = chapters.findIndex((currentChapter) => currentChapter.chapterId === chapterId);
			chapters.splice(chapterIndex);
			break;
		}
		if (chapters.length === 0) continue;

		const { title, url, image } = await client.api.mangadex.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = chapters
			.slice(0, 10)
			.reverse()
			.map(({ title, url }) => `**[${title}](${url})**`);
		const hiddenChaptersCount = chapters.length - formattedChapters.length;
		if (hiddenChaptersCount > 0) formattedChapters.push(`And ${hiddenChaptersCount} more!`);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setDescription(formattedChapters.join('\n'))
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Manga', embeds });
};
