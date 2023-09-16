import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

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
			const isSuccessful = await client.state({ title: chapter.id, url: chapter.url });
			if (isSuccessful) continue;
			chapters.splice(chapters.findIndex((currentChapter) => currentChapter.chapter.id === chapter.id));
		}
		if (chapters.length === 0) continue;

		const { title, url, image, publication, tags } = await client.api.mangadex.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = chapters
			.slice(0, 10)
			.reverse()
			.map(({ chapter }) => `**[${chapter.title}](${chapter.url})**`);
		const hiddenChaptersCount = chapters.length - formattedChapters.length;
		if (hiddenChaptersCount > 0) formattedChapters.push(t('common.list.more', { size: hiddenChaptersCount }));

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`*${publication}*`)
			.addFields([
				{
					name: t('jobs.manga.embed.fields.0.name'),
					value: tags.map((tag) => `\`${tag}\``).join() || t('common.unavailable'),
				},
				{
					name: t('jobs.manga.embed.fields.1.name'),
					value: formattedChapters.join('\n') || t('common.unavailable'),
				},
			])
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Manga', embeds });
};
